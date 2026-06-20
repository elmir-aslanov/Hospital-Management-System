import Shift from '../../models/Shift.model.js';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

const dayBounds = (dateStr) => {
  const start = new Date(dateStr); start.setHours(0, 0, 0, 0);
  const end   = new Date(dateStr); end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Active (non-cancelled, non-absence) shift statuses — these are the only
// ones that can actually overlap in a way that double-books a staff member.
const ACTIVE_SHIFT_STATUSES = ['scheduled', 'active', 'completed'];

export const createShift = async (data, assignedBy) => {
  const user = await User.findById(data.userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (data.startTime >= data.endTime) {
    throw new ApiError(400, 'Start time must be before end time');
  }
  if (data.breakStartTime && data.breakEndTime && data.breakStartTime >= data.breakEndTime) {
    throw new ApiError(400, 'Break start time must be before break end time');
  }

  const { start, end } = dayBounds(data.date);

  // Overlap check: same user on same date, time ranges overlap
  const overlap = await Shift.findOne({
    userId: data.userId,
    date:   { $gte: start, $lte: end },
    status: { $in: ACTIVE_SHIFT_STATUSES },
    $or: [
      { startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime } },
    ],
  });
  if (overlap) throw new ApiError(409, 'Staff member already has a shift at this time');

  return Shift.create({ ...data, assignedBy, date: new Date(data.date) });
};

export const getShifts = async ({ wardId, departmentId, date, shiftType, userId, role, status, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};
  if (wardId)       filter.wardId       = wardId;
  if (departmentId) filter.departmentId = departmentId;
  if (shiftType)    filter.shiftType    = shiftType;
  if (userId)       filter.userId       = userId;
  if (status)       filter.status       = status;
  if (date) {
    const { start, end } = dayBounds(date);
    filter.date = { $gte: start, $lte: end };
  }
  if (role) {
    const userIds = await User.find({ role }).distinct('_id');
    filter.userId = filter.userId ? filter.userId : { $in: userIds };
  }

  const [shifts, total] = await Promise.all([
    Shift.find(filter)
      .populate('userId', 'fullName role')
      .populate('wardId', 'name type')
      .populate('departmentId', 'name')
      .sort({ date: 1, startTime: 1 }).skip(skip).limit(lim),
    Shift.countDocuments(filter),
  ]);
  return { shifts, total, page: pg, limit: lim };
};

export const getMyShifts = async (userId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const [shifts, total] = await Promise.all([
    Shift.find({ userId })
      .populate('wardId', 'name type')
      .sort({ date: -1 }).skip(skip).limit(lim),
    Shift.countDocuments({ userId }),
  ]);
  return { shifts, total, page: pg, limit: lim };
};

export const updateShiftStatus = async (shiftId, status) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) throw new ApiError(404, 'Shift not found');
  shift.status = status;
  await shift.save();
  return shift;
};

export const getTodayShifts = async (wardId) => {
  const { start, end } = dayBounds(new Date().toISOString().slice(0, 10));
  const filter = { date: { $gte: start, $lte: end } };
  if (wardId) filter.wardId = wardId;

  const shifts = await Shift.find(filter)
    .populate('userId', 'fullName role')
    .populate('wardId', 'name')
    .sort({ startTime: 1 });

  const grouped = { morning: [], afternoon: [], night: [] };
  shifts.forEach((s) => grouped[s.shiftType].push(s));
  return grouped;
};

export const getWeeklySchedule = async (userId) => {
  const now  = new Date(); now.setHours(0, 0, 0, 0);
  const week = new Date(now); week.setDate(week.getDate() + 7); week.setHours(23, 59, 59, 999);

  return Shift.find({ userId, date: { $gte: now, $lte: week } })
    .populate('wardId', 'name')
    .sort({ date: 1, startTime: 1 });
};
