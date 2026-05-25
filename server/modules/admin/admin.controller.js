import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import User         from '../../models/User.model.js';
import Doctor       from '../../models/Doctor.model.js';
import Patient      from '../../models/Patient.model.js';
import Appointment  from '../../models/Appointment.model.js';
import Muraciet     from '../muraciet/muraciet.model.js';

export const getStats = asyncHandler(async (_req, res) => {
  const [doctors, patients, appointments, muraciet] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Appointment.countDocuments(),
    Muraciet.countDocuments(),
  ]);
  res.json(new ApiResponse(200, { doctors, patients, appointments, muraciet }));
});

export const getRecentAppointments = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const appointments = await Appointment.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({ path: 'patientId', select: 'userId', populate: { path: 'userId', select: 'fullName' } })
    .populate({ path: 'doctorId', select: 'userId specialization', populate: { path: 'userId', select: 'fullName' } })
    .lean();
  res.json(new ApiResponse(200, appointments));
});
