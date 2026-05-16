import bcrypt from 'bcryptjs';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import OTP from '../../models/OTP.model.js';
import User from '../../models/User.model.js';
import { generateOTP, sendOTP } from '../../utils/otpService.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateTokens.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const PHONE_REGEX = /^\+994[0-9]{9}$/;

// POST /api/v1/auth/send-otp
export const sendOtpHandler = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) throw new ApiError(400, 'Telefon nömrəsi tələb olunur.');
  if (!PHONE_REGEX.test(phone)) {
    throw new ApiError(400, 'Düzgün Azərbaycan telefon nömrəsi daxil edin. (+994XXXXXXXXX)');
  }

  // Rate limit: max 3 OTP requests per 10 minutes
  const recentCount = await OTP.countDocuments({
    phone,
    createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
  });
  if (recentCount >= 3) {
    throw new ApiError(429, '10 dəqiqə ərzində çox sayda sorğu. Bir az gözləyin.');
  }

  // Remove any existing OTPs for this phone
  await OTP.deleteMany({ phone });

  // Generate and persist new OTP
  const otp = generateOTP();
  await OTP.create({ phone, otp });

  // Send SMS (dev: console, prod: Twilio)
  const result = await sendOTP(phone, otp);
  if (!result.success && process.env.NODE_ENV !== 'development') {
    throw new ApiError(500, 'SMS göndərilmədi. Yenidən cəhd edin.');
  }

  res.status(200).json(new ApiResponse(200, {
    // Expose OTP only in development — remove in production
    ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
  }, 'OTP kodu göndərildi.'));
});

// POST /api/v1/auth/verify-otp
export const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) throw new ApiError(400, 'Telefon və OTP tələb olunur.');

  const record = await OTP.findOne({ phone, verified: false }).sort({ createdAt: -1 });

  if (!record) {
    throw new ApiError(400, 'OTP tapılmadı. Yenidən kod alın.');
  }
  if (new Date() > record.expiresAt) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(400, 'OTP müddəti bitib. Yenidən kod alın.');
  }
  if (record.attempts >= 3) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(400, 'Çox sayda yanlış cəhd. Yenidən kod alın.');
  }
  if (record.otp !== otp.trim()) {
    record.attempts += 1;
    await record.save();
    const remaining = 3 - record.attempts;
    throw new ApiError(400, `Yanlış OTP. ${remaining} cəhd qalır.`);
  }

  // OTP correct
  await OTP.deleteOne({ _id: record._id });

  // Find or auto-create patient
  let user = await User.findOne({ phone, role: 'PATIENT' });

  if (!user) {
    const randomPassword = await bcrypt.hash(phone + Date.now().toString(), 10);
    user = new User({
      fullName: 'Pasiyent',
      email: `otp_${phone.replace('+', '')}@aslanmedical.internal`,
      password: randomPassword,
      role: 'PATIENT',
      phone,
      isActive: true,
    });
    // Skip password re-hash (already hashed above)
    await user.save({ validateBeforeSave: false });
  }

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
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    }, 'Giriş uğurlu.'));
});
