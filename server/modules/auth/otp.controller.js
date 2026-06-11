import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import User         from '../../models/User.model.js';
import OTP          from '../../models/OTP.model.js';
import { sendEmailOTP }                                   from '../../utils/otpService.js';
import { generateAccessToken, generateRefreshToken }      from '../../utils/generateTokens.js';
import { getRefreshCookieOptions } from './auth.cookies.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── POST /api/v1/auth/request-email-otp ──────────────────────────────────────

export const requestEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, 'Düzgün e-poçt daxil edin.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new ApiError(404, 'İstifadəçi tapılmadı.');

  const otp       = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Remove any previous unused OTPs for this email
  await OTP.deleteMany({ email: normalizedEmail, type: 'email', usedAt: null });

  await OTP.create({ email: normalizedEmail, type: 'email', hashedOtp: otp, expiresAt, lastResendAt: new Date() });

  const result = await sendEmailOTP(email, otp);
  if (!result.success) throw new ApiError(500, 'Email göndərilmədi. Yenidən cəhd edin.');

  res.json(new ApiResponse(200, null, 'OTP e-poçtunuza göndərildi.'));
});

// ── POST /api/v1/auth/verify-email-otp ───────────────────────────────────────

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, 'E-poçt və OTP tələb olunur.');

  const normalizedEmail = email.toLowerCase().trim();
  const record = await OTP.findOne({ email: normalizedEmail, type: 'email', usedAt: null }).sort({ createdAt: -1 });

  if (!record)                    throw new ApiError(400, 'OTP müddəti bitib və ya tapılmadı.');
  if (new Date() > record.expiresAt) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(400, 'OTP müddəti bitib və ya tapılmadı.');
  }
  if (record.hashedOtp !== otp.trim()) throw new ApiError(400, 'OTP yanlışdır.');

  record.usedAt = new Date();
  await record.save();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user)        throw new ApiError(404, 'İstifadəçi tapılmadı.');
  if (!user.isActive) throw new ApiError(403, 'Hesab deaktiv edilib.');

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

  res.json(new ApiResponse(200, {
    accessToken,
    user: {
      _id:      user._id,
      fullName: user.fullName,
      email:    user.email,
      role:     user.role,
      avatar:   user.avatar,
    },
  }, 'Uğurla daxil oldunuz.'));
});
