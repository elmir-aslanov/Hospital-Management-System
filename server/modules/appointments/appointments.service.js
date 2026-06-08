import crypto from 'crypto';
import Appointment from '../../models/Appointment.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import WorkSchedule from '../../models/WorkSchedule.model.js';
import ApiError from '../../utils/ApiError.js';
import { APPOINTMENT_STATUS, APPOINTMENT_TRANSITIONS } from '../../config/constants.js';
import { createNotification } from '../notifications/notifications.service.js';
import User from '../../models/User.model.js';

// ─── Population helpers ───────────────────────────────────────────────────────

const populateAppointment = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email phone' } })
    .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization' });

// ─── Pagination helper ────────────────────────────────────────────────────────

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createAppointment = async ({ patientId, doctorId, date, startTime, endTime, reason, time, note }) => {
  // Normalize fields — frontend may send time/note instead of startTime/endTime/reason
  if (!startTime && time) { startTime = time; }
  if (!endTime   && time) {
    const [h, m] = time.split(':').map(Number);
    endTime = `${String(h).padStart(2,'0')}:${String((m + 30) % 60).padStart(2,'0')}`;
    if (m + 30 >= 60) endTime = `${String(h + 1).padStart(2,'0')}:${String((m + 30) % 60).padStart(2,'0')}`;
  }
  if (!reason) reason = note || 'Müayinə';

  // Step 1 & 2 — verify patient and doctor exist
  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(doctorId),
  ]);
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!doctor)  throw new ApiError(404, 'Doctor not found');

  // Step 3 — check work schedule
  // UTC noon avoids timezone midnight-shift when calculating day-of-week
  const apptDate  = new Date(`${date}T00:00:00.000Z`);
  const dayOfWeek = new Date(`${date}T12:00:00.000Z`).getUTCDay();
  const schedule  = await WorkSchedule.findOne({ doctorId, dayOfWeek });

  // Mirror getPublicSlots fallback: if no schedule entry, use clinic defaults
  let schedStart, schedEnd;
  if (!schedule) {
    const def = DEFAULT_HOURS[dayOfWeek];
    if (!def) throw new ApiError(400, 'Bazar günü qəbul yoxdur.');
    schedStart = def.start;
    schedEnd   = def.end;
  } else if (schedule.isOff) {
    throw new ApiError(400, 'Həkim bu gün işləmir.');
  } else {
    schedStart = schedule.startTime;
    schedEnd   = schedule.endTime;
  }

  if (startTime < schedStart || endTime > schedEnd) {
    throw new ApiError(400, `Seçilmiş saat həkimin iş saatları xaricindədir (${schedStart}–${schedEnd}).`);
  }

  // Step 4 — conflict detection (UTC range to avoid timezone mismatch)
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd   = new Date(`${date}T23:59:59.999Z`);

  const conflict = await Appointment.findOne({
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.MISSED, 'no_show', APPOINTMENT_STATUS.COMPLETED] },
    $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
  });
  if (conflict) throw new ApiError(409, 'Bu saat artıq tutulub. Zəhmət olmasa başqa saat seçin.');

  // Step 5 — create
  const appointment = await Appointment.create({ patientId, doctorId, date: apptDate, startTime, endTime, reason });

  // Notify patient
  try {
    const patientUser = await User.findById(patient.userId);
    const doctorUser  = await User.findById(doctor.userId);
    const dateStr     = new Date(date).toLocaleDateString('az-AZ');
    if (patientUser) {
      await createNotification({
        userId:  patientUser._id,
        title:   'Randevunuz təsdiqləndi',
        message: `${dateStr} tarixində saat ${startTime}–${endTime} arası Dr. ${doctorUser?.fullName || 'Həkim'} ilə randevunuz yaradıldı.`,
        type:    'appointment',
        link:    '/patient/appointments',
      });
    }
    // Notify doctor
    if (doctorUser) {
      await createNotification({
        userId:  doctorUser._id,
        title:   'Yeni randevu',
        message: `${patientUser?.fullName || 'Pasiyent'} — ${dateStr} saat ${startTime} üçün randevu yaratdı.`,
        type:    'appointment',
        link:    '/doctor/appointments',
      });
    }
  } catch (_) {}

  try {
    const admins  = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'] }, isActive: true }).select('_id');
    const dateStr = new Date(apptDate).toLocaleDateString('az-AZ');
    await Promise.all(admins.map(a => createNotification({
      userId:  a._id,
      title:   'Yeni randevu yaradıldı',
      message: `${dateStr} saat ${startTime}–${endTime} üçün yeni randevu əlavə edildi.`,
      type:    'appointment',
      link:    '/admin/appointments',
    })));
  } catch (_) {}

  return populateAppointment(Appointment.findById(appointment._id));
};

// ─── Public available slots (no auth) ────────────────────────────────────────

// Default clinic working hours used when doctor has no WorkSchedule entry
const DEFAULT_HOURS = {
  1: { start: '09:00', end: '18:00' }, // Mon
  2: { start: '09:00', end: '18:00' }, // Tue
  3: { start: '09:00', end: '18:00' }, // Wed
  4: { start: '09:00', end: '18:00' }, // Thu
  5: { start: '09:00', end: '18:00' }, // Fri
  6: { start: '09:00', end: '14:00' }, // Sat
  0: null,                              // Sun — closed
};
const DEFAULT_SLOT_DURATION = 30; // minutes

function minsToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
function timeToMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export const getPublicSlots = async (doctorId, dateStr) => {
  if (!doctorId) throw new ApiError(400, 'doctorId tələb olunur');
  if (!dateStr)  throw new ApiError(400, 'date tələb olunur (YYYY-MM-DD)');

  // Parse date at UTC noon to avoid timezone midnight shift (consistent with createAppointment)
  const date = new Date(`${dateStr}T12:00:00.000Z`);
  if (isNaN(date.getTime())) throw new ApiError(400, 'Tarix formatı səhvdir. YYYY-MM-DD istifadə edin.');

  const dayOfWeek = date.getUTCDay();

  // Try doctor-specific schedule first
  const schedule = await WorkSchedule.findOne({ doctorId, dayOfWeek });

  let startTime, endTime, slotDuration;

  if (schedule) {
    if (schedule.isOff) {
      return { date: dateStr, doctorId, available: false, slots: [], reason: 'İstirahət günüdür' };
    }
    startTime    = schedule.startTime;
    endTime      = schedule.endTime;
    slotDuration = schedule.slotDuration || DEFAULT_SLOT_DURATION;
  } else {
    // Fallback to clinic defaults
    const defaults = DEFAULT_HOURS[dayOfWeek];
    if (!defaults) {
      return { date: dateStr, doctorId, available: false, slots: [], reason: 'Bazar günü qəbul yoxdur' };
    }
    startTime    = defaults.start;
    endTime      = defaults.end;
    slotDuration = DEFAULT_SLOT_DURATION;
  }

  // Fetch already booked appointments — UTC range matches how dates are stored
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd   = new Date(`${dateStr}T23:59:59.999Z`);

  const booked = await Appointment.find({
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: ['cancelled', 'missed', 'no_show', 'completed'] },
  }).select('startTime');

  const bookedSet = new Set(booked.map(a => a.startTime));

  // Past-time buffer for today (15 min)
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday  = dateStr === todayStr;
  const nowMins  = isToday
    ? (new Date().getHours() * 60 + new Date().getMinutes() + 15)
    : 0;

  // Generate slots
  const slots = [];
  let cur = timeToMins(startTime);
  const end = timeToMins(endTime);

  while (cur + slotDuration <= end) {
    const time = minsToTime(cur);
    const pastTime = isToday && cur < nowMins;
    slots.push({ time, available: !bookedSet.has(time) && !pastTime });
    cur += slotDuration;
  }

  return { date: dateStr, doctorId, available: true, slots };
};

// ─── Public booking (no auth) — existing OR new patient ──────────────────────

export const createPublicAppointment = async (body) => {
  const {
    patientType = 'existing',
    doctorId, date, startTime, reason, notes,
  } = body;

  if (!doctorId)  throw new ApiError(400, 'Həkim seçilməlidir');
  if (!date)      throw new ApiError(400, 'Tarix seçilməlidir');
  if (!startTime) throw new ApiError(400, 'Saat seçilməlidir');

  let patientMongoId;

  // ── NEW PATIENT ────────────────────────────────────────────────────────────
  if (patientType === 'new') {
    const pd = body.patient || {};
    const { firstName, lastName, fatherName, phone, email, fin, birthDate } = pd;

    if (!firstName?.trim()) throw new ApiError(400, 'Ad daxil edilməlidir');
    if (!lastName?.trim())  throw new ApiError(400, 'Soyad daxil edilməlidir');
    if (!phone?.trim())     throw new ApiError(400, 'Telefon daxil edilməlidir');
    if (!birthDate)         throw new ApiError(400, 'Doğum tarixi daxil edilməlidir');

    const fullName   = `${firstName.trim()} ${lastName.trim()}`;
    const cleanPhone = phone.trim();

    // Reuse existing user account if same phone already registered
    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      const guestEmail = email?.trim()?.toLowerCase()
        || `walkin.${cleanPhone.replace(/\D/g, '')}.${Date.now()}@aslanmedical.az`;

      user = await User.create({
        fullName,
        ataAdi:    fatherName?.trim() || undefined,
        email:     guestEmail,
        phone:     cleanPhone,
        role:      'PATIENT',
        password:  crypto.randomBytes(24).toString('hex'), // hashed by pre-save hook
        birthDate: new Date(birthDate),
        isActive:  true,
      });
    }

    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) patient = await Patient.create({ userId: user._id });

    patientMongoId = patient._id;

  // ── EXISTING PATIENT ───────────────────────────────────────────────────────
  } else {
    const { patientStrId } = body;
    if (!patientStrId?.trim()) throw new ApiError(400, 'Pasiyent ID daxil edilməlidir');

    const patient = await Patient.findOne({ patientId: patientStrId.trim().toUpperCase() });
    if (!patient) throw new ApiError(404, 'Bu ID ilə pasiyent tapılmadı. Zəhmət olmasa resepsiyona müraciət edin.');

    patientMongoId = patient._id;
  }

  // ── CREATE APPOINTMENT ─────────────────────────────────────────────────────
  // Compute endTime (30-min slot) — model requires it
  const [apptH, apptM] = startTime.split(':').map(Number);
  const endTotalMins = apptH * 60 + apptM + 30;
  const endTime = `${String(Math.floor(endTotalMins / 60)).padStart(2, '0')}:${String(endTotalMins % 60).padStart(2, '0')}`;

  const appointment = await createAppointment({
    patientId: patientMongoId,
    doctorId,
    date,
    startTime,
    endTime,
    reason: reason?.trim() || 'Onlayn randevu',
    note:   notes,
  });

  const doctor = await Doctor.findById(doctorId)
    .populate('userId', 'fullName')
    .populate('departmentId', 'name');

  return {
    appointmentId:     appointment._id,
    appointmentNumber: `APP-${new Date().getFullYear()}-${String(appointment._id).slice(-6).toUpperCase()}`,
    date,
    time:           startTime,
    doctorName:     doctor?.userId?.fullName ? `Dr. ${doctor.userId.fullName}` : '—',
    departmentName: doctor?.departmentId?.name || doctor?.department || '—',
    status:         appointment.status,
  };
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getAppointments = async ({ status, doctorId, patientId, date, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);

  const filter = {};
  if (status)    filter.status    = status;
  if (doctorId)  filter.doctorId  = doctorId;
  if (patientId) filter.patientId = patientId;
  if (date) {
    const d = new Date(date);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end   = new Date(d); end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const [appointments, total] = await Promise.all([
    populateAppointment(Appointment.find(filter)).sort({ date: -1, startTime: 1 }).skip(skip).limit(lim),
    Appointment.countDocuments(filter),
  ]);

  return { appointments, total, page: pg, limit: lim };
};

export const getAppointmentById = async (id) => {
  const appointment = await populateAppointment(Appointment.findById(id));
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  return appointment;
};

export const getPatientAppointments = async (patientId, { status, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = { patientId };
  if (status) filter.status = status;

  const [appointments, total] = await Promise.all([
    populateAppointment(Appointment.find(filter)).sort({ date: -1 }).skip(skip).limit(lim),
    Appointment.countDocuments(filter),
  ]);

  return { appointments, total, page: pg, limit: lim };
};

export const getDoctorAppointments = async (doctorId, { date, status, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = { doctorId };
  if (status) filter.status = status;
  if (date) {
    const d     = new Date(date);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end   = new Date(d); end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const [appointments, total] = await Promise.all([
    populateAppointment(Appointment.find(filter)).sort({ date: 1, startTime: 1 }).skip(skip).limit(lim),
    Appointment.countDocuments(filter),
  ]);

  return { appointments, total, page: pg, limit: lim };
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateAppointmentStatus = async (appointmentId, status, userId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const allowed = APPOINTMENT_TRANSITIONS[appointment.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition: '${appointment.status}' → '${status}'. Allowed: [${allowed.join(', ') || 'none'}]`
    );
  }

  appointment.status = status;
  if (status === APPOINTMENT_STATUS.CANCELLED) appointment.cancelledBy = userId;
  await appointment.save();

  // Notify patient on key status changes
  try {
    const patient = await Patient.findById(appointment.patientId);
    const patientUser = patient ? await User.findById(patient.userId) : null;
    const STATUS_MESSAGES = {
      confirmed:   { title: 'Randevunuz təsdiqləndi',  message: 'Randevunuz həkim tərəfindən təsdiqləndi.' },
      completed:   { title: 'Müayinəniz tamamlandı',   message: 'Müayinəniz uğurla tamamlandı.' },
      cancelled:   { title: 'Randevunuz ləğv edildi',  message: 'Randevunuz ləğv edildi.' },
      in_progress: { title: 'Müayinəniz başladı',      message: 'Növbəniz gəldi, müayinəniz başlayır.' },
    };
    const msg = STATUS_MESSAGES[status];
    if (patientUser && msg) {
      await createNotification({
        userId:  patientUser._id,
        title:   msg.title,
        message: msg.message,
        type:    'appointment',
        link:    '/patient/appointments',
      });
    }
  } catch (_) {}

  return populateAppointment(Appointment.findById(appointment._id));
};

export const cancelAppointment = async (appointmentId, userId, cancelReason) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  if ([APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED].includes(appointment.status)) {
    throw new ApiError(400, `Cannot cancel an appointment with status '${appointment.status}'`);
  }

  appointment.status       = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancelledBy  = userId;
  appointment.cancelReason = cancelReason || '';
  await appointment.save();

  try {
    const patient     = await Patient.findById(appointment.patientId);
    const patientUser = patient ? await User.findById(patient.userId) : null;
    if (patientUser) {
      await createNotification({
        userId:  patientUser._id,
        title:   'Randevunuz ləğv edildi',
        message: cancelReason
          ? `Randevunuz ləğv edildi. Səbəb: ${cancelReason}`
          : 'Randevunuz ləğv edildi.',
        type:    'appointment',
        link:    '/patient/appointments',
      });
    }
  } catch (_) {}

  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'] }, isActive: true }).select('_id');
    await Promise.all(admins.map(a => createNotification({
      userId:  a._id,
      title:   'Randevu ləğv edildi',
      message: cancelReason ? `Randevu ləğv edildi. Səbəb: ${cancelReason}` : 'Randevu ləğv edildi.',
      type:    'appointment',
      link:    '/admin/appointments',
    })));
  } catch (_) {}

  return populateAppointment(Appointment.findById(appointment._id));
};

export const rescheduleAppointment = async (appointmentId, { date, startTime, endTime }, userId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const cancellable = ['completed', 'cancelled', 'missed'];
  if (cancellable.includes(appointment.status)) {
    throw new ApiError(400, `Cannot reschedule an appointment with status '${appointment.status}'`);
  }

  // Conflict check — same doctor, same date, overlapping time, excluding this appointment
  const conflict = await Appointment.findOne({
    _id:      { $ne: appointmentId },
    doctorId: appointment.doctorId,
    date:     new Date(date),
    status:   { $nin: ['cancelled', 'missed'] },
    $or: [
      { startTime: { $lt: endTime,   $gte: startTime } },
      { endTime:   { $gt: startTime, $lte: endTime   } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
    ],
  });
  if (conflict) throw new ApiError(409, 'Bu vaxt aralığında həkim məşğuldur');

  appointment.date      = new Date(date);
  appointment.startTime = startTime;
  appointment.endTime   = endTime;
  appointment.status    = 'scheduled';
  await appointment.save();
  return populateAppointment(Appointment.findById(appointment._id));
};
