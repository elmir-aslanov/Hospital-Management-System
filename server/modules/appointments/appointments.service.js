import Appointment from '../../models/Appointment.model.js';
import ApiError from '../../utils/ApiError.js';
import { getPagination, paginatedResponse } from '../../utils/pagination.js';
import { APPOINTMENT_STATUS } from '../../config/constants.js';

const detectConflict = async (doctorId, date, startTime, endTime, excludeId = null) => {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart.getTime() + 86400000);

  const query = {
    doctorId,
    date: { $gte: dateStart, $lt: dateEnd },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW] },
    $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
  };

  if (excludeId) query._id = { $ne: excludeId };

  const conflict = await Appointment.findOne(query);
  if (conflict) throw new ApiError(409, 'This time slot is already booked');
};

export const createAppointment = async (data) => {
  await detectConflict(data.doctorId, data.date, data.startTime, data.endTime);
  return Appointment.create(data);
};

export const getAppointments = async (query) => {
  const { skip, limit, page } = getPagination(query);
  const filter = {};
  if (query.doctorId) filter.doctorId = query.doctorId;
  if (query.patientId) filter.patientId = query.patientId;
  if (query.status) filter.status = query.status;
  if (query.date) {
    const d = new Date(query.date);
    filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }

  const [data, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'specialization')
      .skip(skip).limit(limit).sort({ date: 1, startTime: 1 }),
    Appointment.countDocuments(filter),
  ]);

  return paginatedResponse(data, total, page, limit);
};

export const getAppointmentById = async (id) => {
  const appt = await Appointment.findById(id)
    .populate('patientId')
    .populate('doctorId');
  if (!appt) throw new ApiError(404, 'Appointment not found');
  return appt;
};

export const updateAppointmentStatus = async (id, status) => {
  const appt = await Appointment.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!appt) throw new ApiError(404, 'Appointment not found');
  return appt;
};

export const cancelAppointment = async (id) => {
  const appt = await Appointment.findByIdAndUpdate(
    id,
    { status: APPOINTMENT_STATUS.CANCELLED },
    { new: true }
  );
  if (!appt) throw new ApiError(404, 'Appointment not found');
  return appt;
};
