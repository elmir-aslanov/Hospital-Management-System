import Notification from '../../models/Notification.model.js';
import { getIO } from '../../config/socket.js';
import logger from '../../utils/logger.js';

/**
 * Create a notification, persist it, and push it to the user's socket room.
 */
export const createNotification = async (userId, title, message, type = 'general', link = '') => {
  const notification = await Notification.create({ userId, title, message, type, link });

  try {
    getIO().to(`user:${userId}`).emit('notification', notification);
  } catch (err) {
    // Socket may not be initialized in tests — log but don't throw
    logger.warn(`Socket emit skipped: ${err.message}`);
  }

  return notification;
};

export const getUserNotifications = async (userId) => {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
};

export const markAllRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};
