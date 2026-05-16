import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phone:      { type: String, trim: true },
  email:      { type: String, trim: true, lowercase: true },
  type:       { type: String, enum: ['phone', 'email'], required: true },
  hashedOtp:  { type: String, required: true },          // bcrypt hash — never plain text
  expiresAt:  { type: Date, required: true },
  attempts:   { type: Number, default: 0 },              // wrong-code attempts
  usedAt:     { type: Date, default: null },              // null = not yet used
  resendCount:   { type: Number, default: 1 },           // how many times OTP was sent
  lastResendAt:  { type: Date, default: Date.now },      // for cooldown enforcement
}, { timestamps: true });

// MongoDB TTL — auto-delete expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Lookup indexes
otpSchema.index({ phone: 1, type: 1 });
otpSchema.index({ email: 1, type: 1 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
