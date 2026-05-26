import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import User         from '../../models/User.model.js';
import Appointment  from '../../models/Appointment.model.js';
import Muraciet     from '../muraciet/muraciet.model.js';

export const getStats = asyncHandler(async (_req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [doctors, patients, appointments, muraciet] = await Promise.all([
    User.countDocuments({ role: 'DOCTOR', isActive: true }),
    User.countDocuments({ role: 'PATIENT' }),
    Appointment.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Muraciet.countDocuments(),
  ]);

  res.json(new ApiResponse(200, { doctors, patients, appointments, muraciet }));
});

export const getRecentAppointments = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const appointments = await Appointment.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({
      path: 'patientId',
      select: 'userId',
      populate: { path: 'userId', select: 'fullName email' },
    })
    .populate({
      path: 'doctorId',
      select: 'userId specialization',
      populate: { path: 'userId', select: 'fullName' },
    })
    .lean();

  res.json(new ApiResponse(200, appointments));
});
