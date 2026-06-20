import ApiError from '../utils/ApiError.js';
import ErrorLog from '../models/ErrorLog.model.js';
import logger from '../utils/logger.js';
import { t, getLang } from '../utils/i18n.js';

// Operational error logs for the admin UI. Fire-and-forget, never blocks the
// response, and only persists 5xx (genuine backend failures) — 4xx are
// expected validation/business errors already returned cleanly to clients.
// Path is stored without its query string and message is truncated by the
// schema, so tokens/secrets that might appear in a query string never land
// here; request bodies/headers/stack traces are never stored at all.
const persistErrorLog = (statusCode, err, req) => {
  if (statusCode < 500) return;
  ErrorLog.create({
    level:      'error',
    statusCode,
    method:     req.method,
    path:       req.originalUrl?.split('?')[0],
    message:    String(err.message || 'Unknown error').slice(0, 1000),
    userId:     req.user?.id || req.user?._id || null,
    role:       req.user?.role || null,
  }).catch((logErr) => logger.error(`ErrorLog write failed: ${logErr.message}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
  const lang = getLang(req);

  if (err instanceof ApiError) {
    persistErrorLog(err.statusCode, err, req);
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: `Duplicate value for field: ${field}`,
      errors: [],
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      statusCode: 422,
      message: 'Validation failed',
      errors,
    });
  }

  // Fallback 500
  persistErrorLog(500, err, req);
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: err.message || t('SERVER_ERROR', lang),
    errors: [],
  });
};
