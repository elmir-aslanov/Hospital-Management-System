import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import AuditLog from '../../models/AuditLog.model.js';

const paginate = (page = 1, limit = 20) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { action, resourceType, userId, startDate, endDate, page, limit } = req.query;
  const { pg, lim, skip } = paginate(page, limit);

  const filter = {};
  if (action)       filter.action       = action;
  if (resourceType) filter.resourceType = resourceType;
  if (userId)       filter.userId       = userId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, { logs, total, page: pg, limit: lim }));
});

export const getUserAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { pg, lim, skip } = paginate(page, limit);
  const { userId } = req.params;

  const [logs, total] = await Promise.all([
    AuditLog.find({ userId })
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    AuditLog.countDocuments({ userId }),
  ]);

  res.status(200).json(new ApiResponse(200, { logs, total, page: pg, limit: lim }));
});
