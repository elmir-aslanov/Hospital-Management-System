import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ErrorLog from '../../models/ErrorLog.model.js';

const paginate = (page = 1, limit = 20) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const getErrorLogs = asyncHandler(async (req, res) => {
  const { level, statusCode, path, startDate, endDate, page, limit } = req.query;
  const { pg, lim, skip } = paginate(page, limit);

  const filter = {};
  if (level)      filter.level      = level;
  if (statusCode) filter.statusCode = Number(statusCode);
  if (path)       filter.path       = { $regex: path, $options: 'i' };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    ErrorLog.find(filter)
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    ErrorLog.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, { logs, total, page: pg, limit: lim }));
});
