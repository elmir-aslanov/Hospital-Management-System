import mongoose from 'mongoose';

// Operational error log — separate from AuditLog (which tracks user actions,
// not application failures) and separate from the Winston file logger (which
// stays the source of truth on disk). This collection only exists so admins
// can browse recent server errors from the UI without shell access.
//
// Never store request bodies, headers, or stack traces here — only the
// already-sanitized fields below.
const errorLogSchema = new mongoose.Schema(
  {
    level:      { type: String, enum: ['error', 'warn'], default: 'error' },
    statusCode: { type: Number },
    method:     { type: String, trim: true },
    path:       { type: String, trim: true, maxlength: 500 },
    message:    { type: String, required: true, trim: true, maxlength: 1000 },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    role:       { type: String, default: null },
    requestId:  { type: String, default: null },
  },
  { timestamps: true }
);

// Sorting recent-first works fine on an ascending index; doubles as the
// auto-expiry index so this operational data doesn't grow unbounded.
errorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
errorLogSchema.index({ statusCode: 1, createdAt: -1 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);
export default ErrorLog;
