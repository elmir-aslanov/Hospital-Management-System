import Notification from '../../models/Notification.model.js';
import { getIO } from '../../config/socket.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

// ─── Create & emit ────────────────────────────────────────────────────────────

export const createNotification = async ({ userId, title, message, type = 'general', link = null }) => {
  const notification = await Notification.create({ userId, title, message, type, link });

  try {
    getIO().to(`user:${userId}`).emit('notification', {
      _id: notification._id,
      title,
      message,
      type,
      link,
      isRead: false,
      createdAt: notification.createdAt,
    });
  } catch (err) {
    logger.warn(`Socket emit skipped: ${err.message}`);
  }

  return notification;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page: pg, limit: lim };
};

// ─── Mark read ────────────────────────────────────────────────────────────────

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) throw new ApiError(404, 'Notification not found');

  notification.isRead = true;
  await notification.save();
  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { modifiedCount: result.modifiedCount };
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) throw new ApiError(404, 'Notification not found');
  await notification.deleteOne();
  return { deleted: true };
};
