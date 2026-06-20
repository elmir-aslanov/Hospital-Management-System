import mongoose from 'mongoose';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import User         from '../../models/User.model.js';
import Appointment  from '../../models/Appointment.model.js';
import Muraciet     from '../muraciet/muraciet.model.js';
import ErrorLog     from '../../models/ErrorLog.model.js';
import redis        from '../../config/redis.js';
import { getIO }    from '../../config/socket.js';

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

// Detailed system health for ADMIN/SUPER_ADMIN — never returns secrets
// (no DB URI, no SMTP password, no API keys/tokens), only booleans/status
// strings plus the already-redacted ErrorLog entries.
const DB_STATE = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

export const getHealth = asyncHandler(async (_req, res) => {
  const dbState = DB_STATE[mongoose.connection.readyState] || 'unknown';

  let socketState = 'not_initialized';
  try { getIO(); socketState = 'connected'; } catch { socketState = 'not_initialized'; }

  const mailConfigured = Boolean(
    (process.env.SMTP_USER || process.env.EMAIL_USER) &&
    (process.env.SMTP_PASS || process.env.EMAIL_PASS)
  );

  const recentErrors = await ErrorLog.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('level statusCode method path message createdAt');

  res.json(new ApiResponse(200, {
    api:        { status: 'healthy' },
    database:   { status: dbState === 'connected' ? 'healthy' : 'error', state: dbState },
    socket:     { status: socketState === 'connected' ? 'healthy' : 'warning', state: socketState },
    mail:       { status: mailConfigured ? 'healthy' : 'warning', configured: mailConfigured },
    queue:      { status: 'disabled', state: redis ? 'enabled' : 'redis_disabled' },
    uptimeSeconds: Math.floor(process.uptime()),
    environment:   process.env.NODE_ENV || 'development',
    recentErrors,
  }));
});
