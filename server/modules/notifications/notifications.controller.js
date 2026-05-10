import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as notificationsService from './notifications.service.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationsService.getUserNotifications(req.user._id);
  res.status(200).json(new ApiResponse(200, notifications));
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationsService.markAllRead(req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});
