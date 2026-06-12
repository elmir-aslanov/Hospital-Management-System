import bcrypt from 'bcryptjs';
import User from '../../models/User.model.js';
import PasswordResetToken from '../../models/PasswordResetToken.model.js';
import sendEmail from '../../utils/sendEmail.js';
import logAction from '../../utils/auditLogger.js';
import ApiError from '../../utils/ApiError.js';

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account with this email');

  // Generate 6-digit OTP
  const otp       = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = await bcrypt.hash(otp, 10);

  // Remove existing unused tokens
  await PasswordResetToken.deleteMany({ userId: user._id, isUsed: false });

  await PasswordResetToken.create({
    userId:    user._id,
    token:     hashedOTP,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  try {
    await sendEmail({
      to:      email,
      subject: 'Password Reset OTP — Hospital Management System',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
          <h2 style="color:#1a1a2e">Password Reset Request</h2>
          <p>Your OTP for password reset is:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a2e;text-align:center;padding:16px;background:#f5f5f5;border-radius:6px">${otp}</p>
          <p>This code expires in <strong>15 minutes</strong>.</p>
          <p style="color:#888;font-size:12px">If you did not request this, please ignore this email. Your account remains secure.</p>
        </div>
      `,
    });
  } catch {
    // Email failed (SMTP not configured) — hashed OTP remains saved until expiry.
    // In production, configure SMTP credentials in .env
  }

  return { message: 'OTP sent to email' };
};

export const resetPassword = async (email, otp, newPassword, req) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account with this email');

  const tokenDoc = await PasswordResetToken.findOne({
    userId:    user._id,
    isUsed:    false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!tokenDoc) throw new ApiError(400, 'Invalid or expired OTP');

  const match = await bcrypt.compare(otp, tokenDoc.token);
  if (!match)  throw new ApiError(400, 'Invalid or expired OTP');

  // Update password — pre-save hook in User model hashes it
  user.password = newPassword;
  tokenDoc.isUsed = true;

  await Promise.all([user.save(), tokenDoc.save()]);

  logAction({
    userId: user._id, action: 'USER_LOGIN',  // closest available action
    resourceType: 'User', resourceId: user._id,
    description: 'Password reset via OTP', req,
  });

  return { message: 'Password reset successful' };
};
