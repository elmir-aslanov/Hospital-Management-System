import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import * as svc     from './contact.service.js';

export const submit = asyncHandler(async (req, res) => {
  const { fullName, email, message, consentAccepted } = req.body;

  if (!fullName?.trim())  throw new ApiError(400, 'Ad Soyad tələb olunur.');
  if (!email?.trim())     throw new ApiError(400, 'E-poçt tələb olunur.');
  if (!message?.trim())   throw new ApiError(400, 'Mesaj tələb olunur.');

  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) throw new ApiError(400, 'Zəhmət olmasa ad və soyadınızı daxil edin.');
  if (fullName.trim().length < 2 || fullName.trim().length > 100)
    throw new ApiError(400, 'Ad Soyad 2-100 simvol arasında olmalıdır.');

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email.trim())) throw new ApiError(400, 'E-poçt formatı düzgün deyil.');

  if (!consentAccepted) throw new ApiError(400, 'Şərtləri qəbul etmədən müraciət göndərə bilməzsiniz.');

  const data = await svc.submit({ fullName, email, message, consentAccepted });
  // data = { id, sentAt, managementToken, email }
  res.status(202).json(new ApiResponse(202, data, 'Təsdiqləmə linki e-poçtunuza göndərildi.'));
});

// GET /contact/verify-email?token=... — public, redirects browser
export const verifyEmail = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
  try {
    await svc.verifyEmail(req.query.token);
    return res.redirect(`${clientUrl}/elaqe?emailVerified=1`);
  } catch (err) {
    const reason =
      err.message === 'expired'      ? 'expired' :
      err.message === 'already-used' ? 'used'    : 'invalid';
    return res.redirect(`${clientUrl}/elaqe?emailVerified=0&reason=${reason}`);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json(new ApiResponse(400, null, 'E-poçt tələb olunur.'));
    }
    const data = await svc.resendVerification(email);
    return res.json(new ApiResponse(200, data, 'Əgər bu e-poçt mövcuddursa, doğrulama linki yenidən göndərildi.'));
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 429) {
      return res.status(429).json({
        statusCode: 429,
        message:    err.message,
        data:       { retryAfter: err.retryAfter ?? 60 },
      });
    }
    next(err);
  }
};

export const changeEmail = async (req, res, next) => {
  try {
    const { email, managementToken } = req.body;
    const { id } = req.params;
    const data = await svc.changeEmail({ id, email, managementToken });
    return res.json(new ApiResponse(200, data, 'E-poçt ünvanı yeniləndi. Yeni doğrulama linki göndərildi.'));
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 429) {
      return res.status(429).json({
        statusCode: 429,
        message:    err.message,
        data:       { retryAfter: err.retryAfter ?? 60 },
      });
    }
    next(err);
  }
};

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
