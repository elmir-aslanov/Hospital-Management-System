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

export const submitHomeService = asyncHandler(async (req, res) => {
  const { fullName, phone, email, address, preferredDate, preferredTimeRange, note, consentAccepted, priceListId } = req.body;

  if (!fullName?.trim())  throw new ApiError(400, 'Ad Soyad tələb olunur.');
  if (fullName.trim().length < 2 || fullName.trim().length > 100)
    throw new ApiError(400, 'Ad Soyad 2-100 simvol arasında olmalıdır.');

  if (!phone?.trim())     throw new ApiError(400, 'Telefon nömrəsi tələb olunur.');
  const phoneRx = /^[+]?[\d\s()-]{7,20}$/;
  if (!phoneRx.test(phone.trim())) throw new ApiError(400, 'Telefon nömrəsi düzgün formatda deyil.');

  if (email?.trim()) {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.trim())) throw new ApiError(400, 'E-poçt formatı düzgün deyil.');
  }

  if (!address?.trim())   throw new ApiError(400, 'Ünvan tələb olunur.');
  if (address.trim().length > 300) throw new ApiError(400, 'Ünvan çox uzundur (maks. 300 simvol).');

  if (note && note.trim().length > 1000) throw new ApiError(400, 'Qeyd çox uzundur (maks. 1000 simvol).');

  if (!consentAccepted)   throw new ApiError(400, 'Şərtləri qəbul etmədən müraciət göndərə bilməzsiniz.');
  if (!priceListId)       throw new ApiError(400, 'Xidmət seçilməyib.');

  await svc.submitHomeService({ fullName, phone, email, address, preferredDate, preferredTimeRange, note, consentAccepted, priceListId });
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

export const updateStatus = asyncHandler(async (req, res) => {
  const data = await svc.updateStatus(req.params.id, req.body.status);
  res.json(new ApiResponse(200, data, 'Status updated'));
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
