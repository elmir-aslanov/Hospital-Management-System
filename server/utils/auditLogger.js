import AuditLog from '../models/AuditLog.model.js';
import logger from './logger.js';

/**
 * Fire-and-forget audit log entry.
 * @param {{ userId, action, resourceType, resourceId, description, req, metadata }} data
 */
const logAction = ({ userId, action, resourceType, resourceId, description, req, metadata }) => {
  const ipAddress = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || req?.ip
    || 'unknown';
  const userAgent = req?.headers?.['user-agent'] || 'unknown';

  // Fire and forget — never block the response
  AuditLog.create({
    userId,
    action,
    resourceType,
    resourceId,
    description,
    ipAddress,
    userAgent,
    metadata,
  }).catch((err) => {
    logger.error(`AuditLog write failed: ${err.message}`);
  });
};

export default logAction;
