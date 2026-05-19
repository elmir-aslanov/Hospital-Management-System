import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import * as svc     from './contact.service.js';

export const submit = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new ApiError(400, 'Ad, e-poçt və mesaj tələb olunur.');
  }
  const data = await svc.submit(req.body);
  res.status(201).json(new ApiResponse(201, data, 'Mesajınız qəbul edildi.'));
});

export const getAll = asyncHandler(async (req, res) => {
  const data = await svc.getAll(req.query);
  res.json(new ApiResponse(200, data));
});

export const markRead = asyncHandler(async (req, res) => {
  const data = await svc.markRead(req.params.id);
  res.json(new ApiResponse(200, data, 'Marked as read'));
});

export const markReplied = asyncHandler(async (req, res) => {
  const data = await svc.markReplied(req.params.id);
  res.json(new ApiResponse(200, data, 'Marked as replied'));
});

export const remove = asyncHandler(async (req, res) => {
  await svc.remove(req.params.id);
  res.json(new ApiResponse(200, null, 'Message deleted'));
});
