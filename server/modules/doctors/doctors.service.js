import Doctor from '../../models/Doctor.model.js';
import WorkSchedule from '../../models/WorkSchedule.model.js';
import Appointment from '../../models/Appointment.model.js';
import ApiError from '../../utils/ApiError.js';
import { getPagination, paginatedResponse } from '../../utils/pagination.js';

export const createDoctor = async (data) => {
  const existing = await Doctor.findOne({ userId: data.userId });
  if (existing) throw new ApiError(409, 'Doctor profile already exists for this user');
  return Doctor.create(data);
};

export const getDoctors = async (query) => {
  const { skip, limit, page } = getPagination(query);
  const filter = {};
  if (query.specialization) filter.specialization = new RegExp(query.specialization, 'i');
  if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable === 'true';

  const [data, total] = await Promise.all([
    Doctor.find(filter).populate('userId', 'fullName email phone avatar').skip(skip).limit(limit),
    Doctor.countDocuments(filter),
  ]);
  return paginatedResponse(data, total, page, limit);
};

export const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id).populate('userId', 'fullName email phone avatar');
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  return doctor;
};

export const updateDoctor = async (id, updates) => {
  const doctor = await Doctor.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  return doctor;
};

export const getDoctorSchedule = async (doctorId) => {
  return WorkSchedule.find({ doctorId }).sort({ dayOfWeek: 1 });
};

export const updateDoctorSchedule = async (doctorId, schedule) => {
  const ops = schedule.map((entry) =>
    WorkSchedule.findOneAndUpdate(
      { doctorId, dayOfWeek: entry.dayOfWeek },
      { ...entry, doctorId },
      { upsert: true, new: true, runValidators: true }
    )
  );
  return Promise.all(ops);
};

/**
 * Returns available time slots for a doctor on a given date.
 * Compares WorkSchedule slots with existing confirmed appointments.
 */
export const getDoctorAvailability = async (doctorId, dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  const schedule = await WorkSchedule.findOne({ doctorId, dayOfWeek });
  if (!schedule || schedule.isOff) return [];

  const existing = await Appointment.find({
    doctorId,
    date: { $gte: new Date(dateStr), $lt: new Date(date.getTime() + 86400000) },
    status: { $nin: ['cancelled', 'no_show'] },
  }).select('startTime endTime');

  // Generate all slots
  const slots = [];
  const [startH, startM] = schedule.startTime.split(':').map(Number);
  const [endH, endM] = schedule.endTime.split(':').map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;

  for (let m = startMins; m + schedule.slotDuration <= endMins; m += schedule.slotDuration) {
    const slotStart = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const slotEndMins = m + schedule.slotDuration;
    const slotEnd = `${String(Math.floor(slotEndMins / 60)).padStart(2, '0')}:${String(slotEndMins % 60).padStart(2, '0')}`;

    const booked = existing.some((a) => a.startTime === slotStart);
    slots.push({ startTime: slotStart, endTime: slotEnd, available: !booked });
  }

  return slots;
};
