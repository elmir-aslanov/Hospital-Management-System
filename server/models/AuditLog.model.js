import mongoose from 'mongoose';

const AUDIT_ACTIONS = [
  'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT',
  'PATIENT_CREATE', 'PATIENT_UPDATE',
  'APPOINTMENT_CREATE', 'APPOINTMENT_CANCEL', 'APPOINTMENT_STATUS_UPDATE',
  'PRESCRIPTION_CREATE',
  'VISIT_CREATE', 'VISIT_CLOSE',
  'DISCHARGE_CREATE',
  'ADMISSION_CREATE', 'PATIENT_DISCHARGE',
  'WARD_CREATE', 'BED_STATUS_UPDATE',
  'VITALS_RECORD',
  'LAB_RESULT_CREATE_MANUAL', 'LAB_RESULT_UPDATE_MANUAL',
  'LAB_RESULT_APPROVE', 'LAB_RESULT_CANCEL', 'LAB_RESULT_PDF_DOWNLOAD',
];

const auditLogSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action:       { type: String, enum: AUDIT_ACTIONS, required: true },
    resourceType: { type: String },
    resourceId:   { type: mongoose.Schema.Types.ObjectId },
    description:  { type: String },
    ipAddress:    { type: String },
    userAgent:    { type: String },
    metadata:     { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export { AUDIT_ACTIONS };
export default AuditLog;
