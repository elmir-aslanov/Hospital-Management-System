import Appointment from '../../models/Appointment.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import WorkSchedule from '../../models/WorkSchedule.model.js';
import ApiError from '../../utils/ApiError.js';
import { APPOINTMENT_STATUS, APPOINTMENT_TRANSITIONS } from '../../config/constants.js';

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

export const createAppointment = async ({ patientId, doctorId, date, startTime, endTime, reason }) => {
  // Step 1 & 2 — verify patient and doctor exist
  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(doctorId),
  ]);
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!doctor)  throw new ApiError(404, 'Doctor not found');

  // Step 3 — check work schedule
  const apptDate  = new Date(date);
  const dayOfWeek = apptDate.getDay();
  const schedule  = await WorkSchedule.findOne({ doctorId, dayOfWeek });

  if (!schedule || schedule.isOff) {
    throw new ApiError(400, 'Doctor is not available on this day');
  }
  if (startTime < schedule.startTime || endTime > schedule.endTime) {
    throw new ApiError(400, `Time is outside doctor working hours (${schedule.startTime}–${schedule.endTime})`);
  }

  // Step 4 — conflict detection
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);

  const conflict = await Appointment.findOne({
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.MISSED] },
    $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
  });
  if (conflict) throw new ApiError(409, 'This time slot is already booked');

  // Step 5 — create
  const appointment = await Appointment.create({ patientId, doctorId, date: apptDate, startTime, endTime, reason });
  return populateAppointment(Appointment.findById(appointment._id));
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
