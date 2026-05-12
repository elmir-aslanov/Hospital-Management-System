import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token:     { type: String, required: true },   // bcrypt-hashed OTP
    expiresAt: { type: Date, required: true },
    isUsed:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ userId: 1 });
// TTL index — MongoDB auto-deletes documents after expiresAt
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;
