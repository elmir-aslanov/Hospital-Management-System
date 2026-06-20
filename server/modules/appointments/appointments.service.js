import crypto from 'crypto';
import Appointment from '../../models/Appointment.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import WorkSchedule from '../../models/WorkSchedule.model.js';
import ApiError from '../../utils/ApiError.js';
import { APPOINTMENT_STATUS, APPOINTMENT_TRANSITIONS } from '../../config/constants.js';
import { createNotification } from '../notifications/notifications.service.js';
import User from '../../models/User.model.js';
import logAction from '../../utils/auditLogger.js';
import sendEmail from '../../utils/sendEmail.js';
import logger from '../../utils/logger.js';

// Best-effort email alongside the in-app notification — never blocks the
// appointment flow. Reminder/notification text intentionally excludes
// clinical details (reason/notes) per privacy requirements.
const sendAppointmentEmail = async (to, subject, bodyText) => {
  if (!to) return; // missing email is handled gracefully — in-app notification still fires
  try {
    await sendEmail({
      to,
      subject,
      html: `<p>${bodyText}</p>`,
    });
  } catch (err) {
    logger.warn(`Appointment email skipped: ${err.message}`);
  }
};

export const ACTIVE_APPOINTMENT_STATUSES = Object.freeze([
  APPOINTMENT_STATUS.SCHEDULED,
  APPOINTMENT_STATUS.WAITING,
  APPOINTMENT_STATUS.IN_PROGRESS,
]);

export const APPOINTMENT_CONFLICT_CODE = 'APPOINTMENT_SLOT_CONFLICT';
const appointmentLocks = new Map();

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

const getUtcDayRange = (date) => {
  const dateString = date instanceof Date
    ? date.toISOString().slice(0, 10)
    : String(date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new ApiError(400, 'Tarix formatı səhvdir. YYYY-MM-DD istifadə edin.');
  }
  const dayStart = new Date(`${dateString}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateString}T23:59:59.999Z`);
  if (Number.isNaN(dayStart.getTime()) || dayStart.toISOString().slice(0, 10) !== dateString) {
    throw new ApiError(400, 'Tarix formatı səhvdir. YYYY-MM-DD istifadə edin.');
  }
  return { dateString, dayStart, dayEnd };
};

// Backend is the final authority on "no past dates" — used by createAppointment
// and rescheduleAppointment so public/admin/receptionist flows can't bypass it
// by calling the shared service with an old date.
const assertNotPastDate = (dayStart) => {
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  if (dayStart.getTime() < todayStart.getTime()) {
    throw new ApiError(400, 'Keçmiş tarixə randevu yaradıla bilməz.', [], '', 'APPOINTMENT_PAST_DATE');
  }
};

export const withAppointmentSlotLock = async ({ doctorId, date }, operation) => {
  const { dateString } = getUtcDayRange(date);
  const key = `${doctorId}:${dateString}`;
  const previous = appointmentLocks.get(key) || Promise.resolve();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const tail = previous.then(() => gate);
  appointmentLocks.set(key, tail);
  await previous;
  try {
    return await operation();
  } finally {
    release();
    if (appointmentLocks.get(key) === tail) appointmentLocks.delete(key);
  }
};

export const assertAppointmentSlotAvailable = async ({
  doctorId,
  date,
  startTime,
  endTime,
  excludeAppointmentId,
}) => {
  const { dayStart, dayEnd } = getUtcDayRange(date);
  const filter = {
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeAppointmentId) filter._id = { $ne: excludeAppointmentId };
  if (await Appointment.exists(filter)) {
    throw new ApiError(
      409,
      'Seçilmiş həkim bu saatda məşğuldur. Zəhmət olmasa başqa saat seçin.',
      [],
      '',
      APPOINTMENT_CONFLICT_CODE,
    );
  }
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
  const { dateString, dayStart } = getUtcDayRange(date);
  assertNotPastDate(dayStart);
  const apptDate  = dayStart;
  const dayOfWeek = new Date(`${dateString}T12:00:00.000Z`).getUTCDay();
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

  // Serialize same doctor/day creates and re-check immediately before insert.
  const appointment = await withAppointmentSlotLock({ doctorId, date: dateString }, async () => {
    await assertAppointmentSlotAvailable({ doctorId, date: dateString, startTime, endTime });
    return Appointment.create({ patientId, doctorId, date: apptDate, startTime, endTime, reason });
  });

  // Notify patient
  try {
    const patientUser = await User.findById(patient.userId);
    const doctorUser  = await User.findById(doctor.userId);
    const dateStr     = new Date(date).toLocaleDateString('az-AZ');
    if (patientUser) {
      const message = `${dateStr} tarixində saat ${startTime}–${endTime} arası Dr. ${doctorUser?.fullName || 'Həkim'} ilə randevunuz yaradıldı.`;
      await createNotification({
        userId:  patientUser._id,
        title:   'Randevunuz təsdiqləndi',
        message,
        type:    'appointment',
        link:    '/patient/appointments',
      });
      await sendAppointmentEmail(patientUser.email, 'Randevunuz təsdiqləndi', message);
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

  // A fully past date (not just an elapsed time-slot on today) has zero
  // available slots — backend is the final authority here too.
  const todayStrCheck = new Date().toISOString().split('T')[0];
  if (dateStr < todayStrCheck) {
    return { date: dateStr, doctorId, available: false, slots: [], reason: 'Keçmiş tarixdir' };
  }

  // Try doctor-specific schedule first
  const schedule = await WorkSchedule.findOne({ doctorId, dayOfWeek });

  let startTime, endTime, slotDuration, breakStartTime, breakEndTime;

  if (schedule) {
    if (schedule.isOff) {
      return { date: dateStr, doctorId, available: false, slots: [], reason: 'İstirahət günüdür' };
    }
    startTime      = schedule.startTime;
    endTime        = schedule.endTime;
    slotDuration   = schedule.slotDuration || DEFAULT_SLOT_DURATION;
    breakStartTime = schedule.breakStartTime || null;
    breakEndTime   = schedule.breakEndTime || null;
  } else {
    // Fallback to clinic defaults — no schedule configured for this doctor/day yet
    const defaults = DEFAULT_HOURS[dayOfWeek];
    if (!defaults) {
      return { date: dateStr, doctorId, available: false, slots: [], reason: 'Bazar günü qəbul yoxdur' };
    }
    startTime    = defaults.start;
    endTime      = defaults.end;
    slotDuration = DEFAULT_SLOT_DURATION;
  }

  // Fetch already booked appointments — UTC range matches how dates are stored
  const { dayStart, dayEnd } = getUtcDayRange(dateStr);

  const booked = await Appointment.find({
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ACTIVE_APPOINTMENT_STATUSES },
  }).select('startTime endTime');

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
    const slotEnd = minsToTime(cur + slotDuration);
    const pastTime = isToday && cur < nowMins;
    const onBreak = !!(breakStartTime && breakEndTime && time < breakEndTime && slotEnd > breakStartTime);
    const overlaps = booked.some(item => item.startTime < slotEnd && item.endTime > time);
    const reason = pastTime ? 'past' : overlaps ? 'booked' : onBreak ? 'break' : null;
    slots.push({ time, available: !reason, reason });
    cur += slotDuration;
  }

  return { date: dateStr, doctorId, available: true, slotDuration, slots };
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

export const updateAppointmentStatus = async (appointmentId, status, userId, { actingDoctorId, isPrivileged } = {}) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (!isPrivileged && String(appointment.doctorId) !== String(actingDoctorId)) {
    throw new ApiError(403, 'You can only update your own appointments');
  }

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
      const message = cancelReason
        ? `Randevunuz ləğv edildi. Səbəb: ${cancelReason}`
        : 'Randevunuz ləğv edildi.';
      await createNotification({
        userId:  patientUser._id,
        title:   'Randevunuz ləğv edildi',
        message,
        type:    'appointment',
        link:    '/patient/appointments',
      });
      await sendAppointmentEmail(patientUser.email, 'Randevunuz ləğv edildi', message);
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

export const rescheduleAppointment = async (appointmentId, { date, startTime, endTime }, userId, req) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const cancellable = [
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.CANCELLED,
    APPOINTMENT_STATUS.MISSED,
  ];
  if (cancellable.includes(appointment.status)) {
    throw new ApiError(400, `Cannot reschedule an appointment with status '${appointment.status}'`);
  }

  const { dayStart: newDayStart } = getUtcDayRange(date);
  assertNotPastDate(newDayStart);

  await withAppointmentSlotLock({ doctorId: appointment.doctorId, date }, async () => {
    await assertAppointmentSlotAvailable({
      doctorId: appointment.doctorId,
      date,
      startTime,
      endTime,
      excludeAppointmentId: appointmentId,
    });
    appointment.date      = getUtcDayRange(date).dayStart;
    appointment.startTime = startTime;
    appointment.endTime   = endTime;
    appointment.status    = APPOINTMENT_STATUS.SCHEDULED;
    // A rescheduled slot needs fresh reminders — clear any prior sends.
    appointment.reminder24hSentAt = null;
    appointment.reminder2hSentAt  = null;
    await appointment.save();
  });

  try {
    const patient     = await Patient.findById(appointment.patientId);
    const patientUser = patient ? await User.findById(patient.userId) : null;
    const dateStr      = new Date(appointment.date).toLocaleDateString('az-AZ');
    if (patientUser) {
      const message = `Randevunuz yeni tarixə köçürüldü: ${dateStr} saat ${startTime}–${endTime}.`;
      await createNotification({
        userId:  patientUser._id,
        title:   'Randevunuz yenidən planlandı',
        message,
        type:    'appointment',
        link:    '/patient/appointments',
      });
      await sendAppointmentEmail(patientUser.email, 'Randevunuz yenidən planlandı', message);
    }
  } catch (_) {}

  logAction({
    userId, action: 'APPOINTMENT_RESCHEDULE', resourceType: 'Appointment', resourceId: appointment._id,
    description: 'Appointment rescheduled', req, metadata: { date: appointment.date, startTime, endTime },
  });

  return populateAppointment(Appointment.findById(appointment._id));
};

// ─── Check-in / queue workflow ─────────────────────────────────────────────────

const isSameUtcDay = (date, reference = new Date()) => {
  const d = new Date(date);
  return d.getUTCFullYear() === reference.getUTCFullYear()
    && d.getUTCMonth() === reference.getUTCMonth()
    && d.getUTCDate() === reference.getUTCDate();
};

// Receptionist/admin confirms the patient has physically arrived. Only today's
// 'scheduled' appointments are eligible — this is exactly the existing
// scheduled → waiting transition, just triggered from the front desk instead
// of a raw status dropdown, with check-in metadata attached.
export const checkInAppointment = async (appointmentId, userId, req) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  if (!isSameUtcDay(appointment.date)) {
    throw new ApiError(400, 'Only today\'s appointments can be checked in', [], '', 'APPOINTMENT_NOT_TODAY');
  }
  if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) {
    throw new ApiError(
      400,
      appointment.checkedInAt
        ? 'This appointment has already been checked in'
        : `Cannot check in an appointment with status '${appointment.status}'`,
      [], '', 'APPOINTMENT_ALREADY_CHECKED_IN',
    );
  }

  const queueNumber = 1 + await Appointment.countDocuments({
    doctorId: appointment.doctorId,
    checkedInAt: { $ne: null },
    date: appointment.date,
  });

  appointment.status      = APPOINTMENT_STATUS.WAITING;
  appointment.checkedInAt = new Date();
  appointment.checkedInBy = userId;
  appointment.queueNumber = queueNumber;
  await appointment.save();

  try {
    const doctor     = await Doctor.findById(appointment.doctorId);
    const doctorUser = doctor ? await User.findById(doctor.userId) : null;
    const patient     = await Patient.findById(appointment.patientId);
    const patientUser = patient ? await User.findById(patient.userId) : null;
    if (doctorUser) {
      await createNotification({
        userId:  doctorUser._id,
        title:   'Pasiyent gəldi',
        message: `${patientUser?.fullName || 'Pasiyent'} qəbula gəldi (Növbə №${queueNumber}).`,
        type:    'appointment',
        link:    '/doctor/dashboard',
      });
    }
  } catch (_) {}

  logAction({
    userId, action: 'APPOINTMENT_CHECKIN', resourceType: 'Appointment', resourceId: appointment._id,
    description: `Patient checked in, queue #${queueNumber}`, req, metadata: { queueNumber },
  });

  return populateAppointment(Appointment.findById(appointment._id));
};

// `actingDoctorId` is the Doctor._id resolved from the caller's own profile.
// When `isPrivileged` is true (ADMIN/SUPER_ADMIN), ownership is not enforced.
export const startConsultation = async (appointmentId, { actingDoctorId, isPrivileged }, userId, req) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (!isPrivileged && String(appointment.doctorId) !== String(actingDoctorId)) {
    throw new ApiError(403, 'You can only start your own appointments');
  }
  if (appointment.status !== APPOINTMENT_STATUS.WAITING) {
    throw new ApiError(400, `Cannot start consultation from status '${appointment.status}'`);
  }

  appointment.status                = APPOINTMENT_STATUS.IN_PROGRESS;
  appointment.consultationStartedAt = new Date();
  await appointment.save();

  logAction({
    userId, action: 'APPOINTMENT_CONSULTATION_START', resourceType: 'Appointment', resourceId: appointment._id,
    description: 'Consultation started', req,
  });

  return populateAppointment(Appointment.findById(appointment._id));
};

export const completeAppointment = async (appointmentId, { actingDoctorId, isPrivileged }, userId, req) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (!isPrivileged && String(appointment.doctorId) !== String(actingDoctorId)) {
    throw new ApiError(403, 'You can only complete your own appointments');
  }
  if (appointment.status !== APPOINTMENT_STATUS.IN_PROGRESS) {
    throw new ApiError(400, `Cannot complete consultation from status '${appointment.status}'`);
  }

  appointment.status      = APPOINTMENT_STATUS.COMPLETED;
  appointment.completedAt = new Date();
  await appointment.save();

  logAction({
    userId, action: 'APPOINTMENT_CONSULTATION_COMPLETE', resourceType: 'Appointment', resourceId: appointment._id,
    description: 'Consultation completed', req,
  });

  return populateAppointment(Appointment.findById(appointment._id));
};

// ─── Reminder scan ──────────────────────────────────────────────────────────
//
// No live job scheduler exists in this project (Redis is disabled — see
// server/config/redis.js — and the BullMQ files under server/jobs/ are not
// imported anywhere). This exposes a minimal, idempotent scan that can be
// triggered by an ops cron / admin action instead of a background worker.
//
// De-duplication: each appointment is claimed atomically via findOneAndUpdate
// with `reminderXSentAt: null` in the filter, so concurrent/overlapping scans
// can never send the same reminder twice. Only `scheduled` appointments are
// eligible — cancelled/missed/completed never receive a reminder.

const combineDateAndTime = (date, hhmm) => {
  const d = new Date(date);
  const [h, m] = String(hhmm || '00:00').split(':').map(Number);
  d.setUTCHours(h, m, 0, 0);
  return d;
};

const claimAndSendReminder = async ({ field, auditAction, title, buildMessage }) => {
  const now = new Date();
  const candidates = await Appointment.find({ status: APPOINTMENT_STATUS.SCHEDULED, [field]: null })
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email' } })
    .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName' } });

  let sent = 0;
  for (const appt of candidates) {
    const apptAt = combineDateAndTime(appt.date, appt.startTime);
    const hoursUntil = (apptAt.getTime() - now.getTime()) / 3_600_000;
    const inWindow = field === 'reminder24hSentAt'
      ? hoursUntil <= 24 && hoursUntil > 2
      : hoursUntil <= 2 && hoursUntil > 0;
    if (!inWindow) continue;

    // Atomic claim — guarantees exactly-once even if scan overlaps itself.
    const claimed = await Appointment.findOneAndUpdate(
      { _id: appt._id, [field]: null, status: APPOINTMENT_STATUS.SCHEDULED },
      { $set: { [field]: new Date() } },
    );
    if (!claimed) continue; // another scan already claimed it

    const patientUser = appt.patientId?.userId;
    const doctorName  = appt.doctorId?.userId?.fullName || 'Həkim';
    const dateStr      = apptAt.toLocaleDateString('az-AZ');
    if (patientUser) {
      const message = buildMessage({ dateStr, startTime: appt.startTime, doctorName });
      try {
        await createNotification({
          userId: patientUser._id, title, message, type: 'appointment', link: '/patient/appointments',
        });
        await sendAppointmentEmail(patientUser.email, title, message);
      } catch (_) {}
    }

    logAction({
      userId: patientUser?._id || null, action: auditAction, resourceType: 'Appointment', resourceId: appt._id,
      description: title,
    });
    sent += 1;
  }
  return sent;
};

export const scanAndSendReminders = async () => {
  const sent24h = await claimAndSendReminder({
    field: 'reminder24hSentAt',
    auditAction: 'APPOINTMENT_REMINDER_24H_SENT',
    title: 'Randevu xatırlatması',
    buildMessage: ({ dateStr, startTime, doctorName }) =>
      `Sabah, ${dateStr} saat ${startTime}-də Dr. ${doctorName} ilə randevunuz var.`,
  });
  const sent2h = await claimAndSendReminder({
    field: 'reminder2hSentAt',
    auditAction: 'APPOINTMENT_REMINDER_2H_SENT',
    title: 'Randevu xatırlatması',
    buildMessage: ({ startTime, doctorName }) =>
      `Bugün saat ${startTime}-də (2 saat sonra) Dr. ${doctorName} ilə randevunuz var.`,
  });
  return { sent24h, sent2h };
};
