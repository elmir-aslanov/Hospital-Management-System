import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import * as svc     from './contact.service.js';

export const submit = asyncHandler(async (req, res) => {
  const { fullName, email, message, consentAccepted } = req.body;

  if (!fullName?.trim())  throw new ApiError(400, 'Ad Soyad tələb olunur.');
  if (!email?.trim())     throw new ApiError(400, 'E-poçt tələb olunur.');
  if (!message?.trim())   throw new ApiError(400, 'Mesaj tələb olunur.');
  if (message.trim().length > 2000) throw new ApiError(400, 'Mesaj çox uzundur (maks. 2000 simvol).');

  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) throw new ApiError(400, 'Zəhmət olmasa ad və soyadınızı daxil edin.');
  if (fullName.trim().length < 2 || fullName.trim().length > 100)
    throw new ApiError(400, 'Ad Soyad 2-100 simvol arasında olmalıdır.');

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email.trim())) throw new ApiError(400, 'E-poçt formatı düzgün deyil.');

  if (!consentAccepted) throw new ApiError(400, 'Şərtləri qəbul etmədən müraciət göndərə bilməzsiniz.');

  await svc.submit({ fullName, email, message, consentAccepted });
  res.status(201).json(new ApiResponse(201, null, 'Müraciətiniz uğurla göndərildi.'));
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

export const sendReply = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const data = await svc.sendReply(req.params.id, { subject, message, adminUser: req.user });
  res.json(new ApiResponse(200, data, 'Cavab göndərildi.'));
});

export const remove = asyncHandler(async (req, res) => {
  await svc.remove(req.params.id);
  res.json(new ApiResponse(200, null, 'Message deleted'));
});
