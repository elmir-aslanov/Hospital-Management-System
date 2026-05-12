import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import Appointment from '../../models/Appointment.model.js';
import Patient from '../../models/Patient.model.js';

const getDateRange = (startDate, endDate) => {
  const end   = endDate   ? new Date(endDate)   : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const DAY_SWITCH = {
  $switch: {
    branches: [
      { case: { $eq: ['$_id', 1] }, then: 'Sunday' },
      { case: { $eq: ['$_id', 2] }, then: 'Monday' },
      { case: { $eq: ['$_id', 3] }, then: 'Tuesday' },
      { case: { $eq: ['$_id', 4] }, then: 'Wednesday' },
      { case: { $eq: ['$_id', 5] }, then: 'Thursday' },
      { case: { $eq: ['$_id', 6] }, then: 'Friday' },
      { case: { $eq: ['$_id', 7] }, then: 'Saturday' },
    ],
    default: 'Unknown',
  },
};

const getTopDoctors = (start, end) =>
  Appointment.aggregate([
    { $match: { status: 'completed', date: { $gte: start, $lte: end } } },
    { $group: { _id: '$doctorId', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 10 },
    { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'users', localField: 'doctor.userId', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $project: { doctorId: '$_id', count: 1, fullName: '$user.fullName', specialization: '$doctor.specialization' } },
  ]);

const getMissedAppointmentRate = async (start, end) => {
  const [total, missed] = await Promise.all([
    Appointment.countDocuments({ date: { $gte: start, $lte: end } }),
    Appointment.countDocuments({ date: { $gte: start, $lte: end }, status: 'missed' }),
  ]);
  return { total, missed, rate: total > 0 ? +((missed / total) * 100).toFixed(2) : 0 };
};

const getBusiestDays = (start, end) =>
  Appointment.aggregate([
    { $match: { date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
    { $group: { _id: { $dayOfWeek: '$date' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { dayOfWeek: '$_id', dayName: DAY_SWITCH, count: 1, _id: 0 } },
  ]);

const getBusiestHours = (start, end) =>
  Appointment.aggregate([
    { $match: { date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
    { $group: { _id: { $substr: ['$startTime', 0, 2] }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { hour: '$_id', count: 1, _id: 0 } },
  ]);

const MONTH_SWITCH = {
  $switch: {
    branches: [
      { case: { $eq: ['$_id.month', 1]  }, then: 'Jan' },
      { case: { $eq: ['$_id.month', 2]  }, then: 'Feb' },
      { case: { $eq: ['$_id.month', 3]  }, then: 'Mar' },
      { case: { $eq: ['$_id.month', 4]  }, then: 'Apr' },
      { case: { $eq: ['$_id.month', 5]  }, then: 'May' },
      { case: { $eq: ['$_id.month', 6]  }, then: 'Jun' },
      { case: { $eq: ['$_id.month', 7]  }, then: 'Jul' },
      { case: { $eq: ['$_id.month', 8]  }, then: 'Aug' },
      { case: { $eq: ['$_id.month', 9]  }, then: 'Sep' },
      { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
      { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
      { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
    ],
    default: '?',
  },
};

const getMonthlyPatientCount = () => {
  const ago = new Date();
  ago.setMonth(ago.getMonth() - 12);
  return Patient.aggregate([
    { $match: { createdAt: { $gte: ago } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $project: { year: '$_id.year', month: '$_id.month', monthName: MONTH_SWITCH, count: 1, _id: 0 } },
  ]);
};

const getAppointmentStatusBreakdown = async (start, end) => {
  const total = await Appointment.countDocuments({ date: { $gte: start, $lte: end } });
  return Appointment.aggregate([
    { $match: { date: { $gte: start, $lte: end } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { status: '$_id', count: 1, percentage: { $round: [{ $multiply: [{ $divide: ['$count', total || 1] }, 100] }, 2] }, _id: 0 } },
  ]);
};

const getSpecializationDemand = (start, end) =>
  Appointment.aggregate([
    { $match: { date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
    { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    { $group: { _id: '$doctor.specialization', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { specialization: '$_id', count: 1, _id: 0 } },
  ]);

export const getAppointmentAnalytics = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
  const [topDoctors, missedRate, busiestDays, busiestHours, monthlyPatients, statusBreakdown, specializationDemand] =
    await Promise.all([
      getTopDoctors(start, end), getMissedAppointmentRate(start, end),
      getBusiestDays(start, end), getBusiestHours(start, end),
      getMonthlyPatientCount(), getAppointmentStatusBreakdown(start, end),
      getSpecializationDemand(start, end),
    ]);
  res.status(200).json(new ApiResponse(200, { topDoctors, missedRate, busiestDays, busiestHours, monthlyPatients, statusBreakdown, specializationDemand, dateRange: { startDate: start, endDate: end } }));
});

export const getTopDoctorsHandler = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse(200, await getTopDoctors(start, end)));
});

export const getMonthlyPatientCountHandler = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, await getMonthlyPatientCount()));
});

export const getAppointmentStatusHandler = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse(200, await getAppointmentStatusBreakdown(start, end)));
});

export const getSpecializationDemandHandler = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse(200, await getSpecializationDemand(start, end)));
});
