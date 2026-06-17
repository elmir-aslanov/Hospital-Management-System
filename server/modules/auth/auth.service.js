import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/User.model.js';
import OTP from '../../models/OTP.model.js';
import Patient from '../../models/Patient.model.js';
import ApiError from '../../utils/ApiError.js';
import sendEmail from '../../utils/sendEmail.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateTokens.js';
import logAction from '../../utils/auditLogger.js';

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');
  const correct = await user.comparePassword(currentPassword);
  if (!correct) throw new ApiError(401, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
};

export const registerUser = async ({ fullName, email, password }, req) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const role = 'PATIENT';
  const user = await User.create({ fullName, email, password, role });

  // Create linked Patient profile so the patient portal can find this user
  try {
    await Patient.create({ userId: user._id });
  } catch (e) {
    console.error('Patient profile create failed:', e.message);
  }

  // Send email verification OTP
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await OTP.create({ email, type: 'email_verify', hashedOtp, expiresAt });
    await sendEmail({
      to: email,
      subject: 'Aslan Medical — E-poçt doğrulaması',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#0a1628">E-poçtunuzu təsdiqləyin</h2>
          <p style="color:#475569">Aşağıdakı kodu daxil edin:</p>
          <div style="font-size:36px;font-weight:900;letter-spacing:12px;color:#00848e;text-align:center;padding:24px;background:#f0fafb;border-radius:12px;margin:20px 0">
            ${otp}
          </div>
          <p style="color:#94a3b8;font-size:13px">Kod 10 dəqiqə ərzində etibarlıdır.</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Email OTP send failed:', e.message);
  }

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  logAction({ userId: user._id, action: 'USER_REGISTER', resourceType: 'User', resourceId: user._id, description: `New user registered: ${email}`, req });

  return { user: { id: user._id, fullName, email, role }, accessToken, refreshToken };
};

export const loginUser = async ({ email, password }, req) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) throw new ApiError(404, 'User not found');

  const valid = await user.comparePassword(password);
  if (!valid) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');
  if (!user.isEmailVerified && user.role === 'PATIENT') {
    throw new ApiError(403, 'E-poçtunuz təsdiqlənməyib. Zəhmət olmasa email-inizə göndərilən kodu daxil edin.');
  }

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  logAction({ userId: user._id, action: 'USER_LOGIN', resourceType: 'User', resourceId: user._id, description: `User logged in: ${email}`, req });

  return { user: { id: user._id, fullName: user.fullName, email, role: user.role }, accessToken, refreshToken };
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new ApiError(401, 'Refresh token required');

  let payload;
  try {
    payload = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(payload.userId).select('+refreshToken');
  if (!user) throw new ApiError(404, 'User not found');
  if (user.refreshToken !== incomingRefreshToken) throw new ApiError(401, 'Refresh token mismatch');

  const accessToken = generateAccessToken(user._id, user.role);
  return { accessToken };
};

export const logoutUser = async (userId, req) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  logAction({ userId, action: 'USER_LOGOUT', resourceType: 'User', resourceId: userId, description: 'User logged out', req });
};
