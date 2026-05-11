import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as notificationsService from './notifications.service.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationsService.getNotifications(req.user.id, req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markAsRead(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, notification, 'Marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationsService.markAllAsRead(req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'All marked as read'));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationsService.deleteNotification(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});
