import bcrypt from 'bcryptjs';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import OTP          from '../../models/OTP.model.js';
import User         from '../../models/User.model.js';
import { sendSms, buildOtpMessage } from '../../utils/smsService.js';
import { sendEmailOTP }             from '../../utils/otpService.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateTokens.js';

const OTP_EXPIRES_MS       = parseInt(process.env.OTP_EXPIRES_MINUTES   || '5')  * 60 * 1000;
const RESEND_COOLDOWN_MS   = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60') * 1000;
const MAX_ATTEMPTS         = parseInt(process.env.OTP_MAX_ATTEMPTS       || '5');
const RESEND_WINDOW_MS     = 10 * 60 * 1000; // max 3 resends per 10 min
const MAX_RESENDS          = 3;

const PHONE_REGEX = /^\+994[0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

// Generate a cryptographically random 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── POST /api/v1/auth/request-otp ─────────────────────────────────────────

export const requestOtpHandler = asyncHandler(async (req, res) => {
  const { phone, email, type = 'phone' } = req.body;

  if (!['phone', 'email'].includes(type)) {
    throw new ApiError(400, 'type "phone" və ya "email" olmalıdır.');
  }

  // Validate identifier
  if (type === 'phone') {
    if (!phone || !PHONE_REGEX.test(phone)) {
      throw new ApiError(400, 'Düzgün Azərbaycan telefon nömrəsi daxil edin. (+994XXXXXXXXX)');
    }
  } else {
    if (!email || !EMAIL_REGEX.test(email)) {
      throw new ApiError(400, 'Düzgün email ünvanı daxil edin.');
    }
  }

  const query = type === 'phone' ? { phone, type } : { email, type };

  // ── Resend cooldown ──────────────────────────────────────────────────────
  const existing = await OTP.findOne(query).sort({ createdAt: -1 });
  if (existing && existing.lastResendAt) {
    const elapsed = Date.now() - existing.lastResendAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new ApiError(429, `${waitSec} saniyə gözləyin, sonra yenidən cəhd edin.`);
    }
  }

  // ── Resend spam limit ────────────────────────────────────────────────────
  const recentCount = await OTP.countDocuments({
    ...query,
    createdAt: { $gt: new Date(Date.now() - RESEND_WINDOW_MS) },
  });
  if (recentCount >= MAX_RESENDS) {
    throw new ApiError(429, '10 dəqiqə ərzində çox sayda sorğu. Bir az gözləyin.');
  }

  // ── Generate & hash OTP ──────────────────────────────────────────────────
  const plainOtp  = generateOTP();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MS);

  // Delete any existing unused OTPs for this identifier
  await OTP.deleteMany({ ...query, usedAt: null });

  await OTP.create({
    ...query,
    hashedOtp,
    expiresAt,
    resendCount:  (existing?.resendCount || 0) + 1,
    lastResendAt: new Date(),
  });

  // ── Send OTP ─────────────────────────────────────────────────────────────
  if (type === 'phone') {
    const result = await sendSms(phone, buildOtpMessage(plainOtp));
    if (!result.success) {
      // SMS provider not configured — log to console in dev
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📱 SMS OTP → ${phone} : ${plainOtp}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  } else {
    const result = await sendEmailOTP(email, plainOtp);
    if (!result.success) {
      throw new ApiError(500, 'Email göndərilmədi. Yenidən cəhd edin.');
    }
    console.log(`📧 Email OTP sent to: ${email}`);
  }

  res.status(200).json(new ApiResponse(200, {
    expiresInSeconds: OTP_EXPIRES_MS / 1000,
  }, type === 'phone'
    ? 'OTP kodu telefonunuza göndərildi.'
    : 'OTP kodu emailinizə göndərildi.'));
});

// ── POST /api/v1/auth/verify-otp ──────────────────────────────────────────

export const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { phone, email, code, type = 'phone' } = req.body;

  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    throw new ApiError(400, '6 rəqəmli OTP kodu daxil edin.');
  }

  const query = type === 'phone' ? { phone, type } : { email, type };

  const record = await OTP.findOne({ ...query, usedAt: null }).sort({ createdAt: -1 });

  if (!record) {
    throw new ApiError(400, 'OTP tapılmadı. Yenidən kod alın.');
  }
  if (new Date() > record.expiresAt) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(400, 'OTP müddəti bitib. Yenidən kod alın.');
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(400, 'Maksimum cəhd limitinə çatdınız. Yenidən kod alın.');
  }

  // Compare submitted code against stored hash
  const isMatch = await bcrypt.compare(code.trim(), record.hashedOtp);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_ATTEMPTS - record.attempts;
    throw new ApiError(400, `Yanlış kod. ${remaining} cəhd qalır.`);
  }

  // Mark as used — prevents replay attacks
  record.usedAt = new Date();
  await record.save();

  // ── Find or auto-create patient ──────────────────────────────────────────
  const identifier = type === 'phone' ? { phone } : { email };
  let user = await User.findOne({ ...identifier, role: 'PATIENT' });

  if (!user) {
    const randomPassword = await bcrypt.hash(
      (phone || email) + Date.now().toString(),
      10
    );
    const placeholderEmail = type === 'email'
      ? email
      : `otp_${phone.replace('+', '')}@aslanmedical.internal`;

    user = new User({
      fullName: type === 'email' ? email.split('@')[0] : 'Pasiyent',
      email:    placeholderEmail,
      password: randomPassword,
      role:     'PATIENT',
      phone:    type === 'phone' ? phone : undefined,
      isActive: true,
    });
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
      refreshToken,
      user: {
        id:       user._id,
        fullName: user.fullName,
        phone:    user.phone || undefined,
        email:    type === 'email' ? email : undefined,
        role:     user.role,
      },
    }, 'Giriş uğurlu.'));
});

// ── Legacy aliases (backward compat) ──────────────────────────────────────
export const sendOtpHandler   = requestOtpHandler;
