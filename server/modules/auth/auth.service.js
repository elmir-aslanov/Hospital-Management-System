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

// Single place that creates a brand-new PATIENT account (User + linked
// Patient profile). Role is always hardcoded here — callers can never pass
// a role through, so no entry point built on top of this can escalate
// privileges. Used by both self-registration and the public lab-request
// "new patient" path so there is exactly one account-creation code path.
export const createPatientAccount = async ({ fullName, name, surname, email, password, phone, birthDate, sexiyyatId }) => {
  const user = await User.create({
    fullName, name, surname, email, password, phone, birthDate, sexiyyatId,
    role: 'PATIENT',
  });

  // No DB transaction support assumed (replica set may not be configured) —
  // if the Patient link fails, undo the User we just created so a
  // login-capable account can never be left without a clinical profile.
  let patient;
  try {
    patient = await Patient.create({ userId: user._id });
  } catch (e) {
    await User.findByIdAndDelete(user._id);
    throw e;
  }

  return { user, patient };
};

export const sendEmailVerificationOtp = async (email) => {
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
};

export const registerUser = async ({ fullName, email, password, age, idCode }, req) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const ageNum = Number(age);
  if (age !== undefined && (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120)) {
    throw new ApiError(400, 'Yaş 1–120 arasında olmalıdır');
  }
  if (idCode !== undefined && String(idCode).trim().length < 5) {
    throw new ApiError(400, 'Şəxsiyyət vəsiqəsi kodu ən az 5 simvol olmalıdır');
  }

  // Only the birth year is known from age, not the exact day — approximate as
  // Jan 1 of that year so User.birthDate/age virtual aren't left empty.
  const birthDate = Number.isFinite(ageNum) && ageNum > 0
    ? new Date(new Date().getFullYear() - ageNum, 0, 1)
    : undefined;
  const sexiyyatId = idCode ? String(idCode).trim() : undefined;
  const { user } = await createPatientAccount({ fullName, email, password, birthDate, sexiyyatId });
  const role = user.role;

  await sendEmailVerificationOtp(email);

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
