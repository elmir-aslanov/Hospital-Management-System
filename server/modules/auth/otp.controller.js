import bcrypt from 'bcryptjs';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import OTP          from '../../models/OTP.model.js';
import User         from '../../models/User.model.js';
import { sendEmailOTP }             from '../../utils/otpService.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateTokens.js';

const OTP_EXPIRES_MS     = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;      // 60 seconds
const MAX_ATTEMPTS       = 5;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── POST /api/v1/auth/request-email-otp ──────────────────────────────────────

export const requestEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) throw new ApiError(404, 'İstifadəçi tapılmadı');

  // Resend cooldown
  const existing = await OTP.findOne({ email, type: 'email' }).sort({ createdAt: -1 });
  if (existing?.lastResendAt) {
    const elapsed = Date.now() - existing.lastResendAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new ApiError(429, `${waitSec} saniyə gözləyin, sonra yenidən cəhd edin.`);
    }
  }

  const plainOtp  = generateOTP();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MS);

  await OTP.deleteMany({ email, type: 'email', usedAt: null });
  await OTP.create({ email, type: 'email', hashedOtp, expiresAt, lastResendAt: new Date() });

  const result = await sendEmailOTP(email, plainOtp);
  if (!result.success) throw new ApiError(500, 'Email göndərilmədi. Yenidən cəhd edin.');

  res.status(200).json(new ApiResponse(200, null, 'OTP e-poçtunuza göndərildi'));
});

// ── POST /api/v1/auth/verify-email-otp ───────────────────────────────────────

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const record = await OTP.findOne({ email, type: 'email', usedAt: null }).sort({ createdAt: -1 });

  if (!record) throw new ApiError(400, 'OTP müddəti bitib və ya tapılmadı');
  if (new Date() > record.expiresAt) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(400, 'OTP müddəti bitib və ya tapılmadı');
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(400, 'Maksimum cəhd limitinə çatdınız. Yenidən kod alın.');
  }

  const isMatch = await bcrypt.compare(otp.trim(), record.hashedOtp);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_ATTEMPTS - record.attempts;
    throw new ApiError(400, `OTP yanlışdır. ${remaining} cəhd qalır.`);
  }

  record.usedAt = new Date();
  await record.save();

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) throw new ApiError(404, 'İstifadəçi tapılmadı');
  if (!user.isActive) throw new ApiError(403, 'Hesab deaktiv edilib.');

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, {
      accessToken,
      user: {
        id:       user._id,
        fullName: user.fullName,
        email:    user.email,
        role:     user.role,
      },
    }, 'Uğurla daxil oldunuz'));
});
