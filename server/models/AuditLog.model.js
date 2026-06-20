import mongoose from 'mongoose';

const AUDIT_ACTIONS = [
  'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT',
  'PATIENT_CREATE', 'PATIENT_UPDATE',
  'APPOINTMENT_CREATE', 'APPOINTMENT_CANCEL', 'APPOINTMENT_STATUS_UPDATE',
  'PRESCRIPTION_CREATE', 'PRESCRIPTION_DELETE',
  'VISIT_CREATE', 'VISIT_CLOSE',
  'DISCHARGE_CREATE',
  'ADMISSION_CREATE', 'PATIENT_DISCHARGE',
  'WARD_CREATE', 'BED_STATUS_UPDATE',
  'VITALS_RECORD',
  'LAB_RESULT_CREATE_MANUAL', 'LAB_RESULT_UPDATE_MANUAL',
  'LAB_RESULT_APPROVE', 'LAB_RESULT_CANCEL', 'LAB_RESULT_PDF_DOWNLOAD',
  'LAB_RESULT_REOPENED_AFTER_EDIT',
  'CREATE_LAB_ORDER', 'CREATE_LAB_RESULT', 'UPDATE_LAB_RESULT', 'VERIFY_LAB_RESULT',
  'CHIEF_APPOINTMENT_REASSIGN', 'CHIEF_LAB_RETURN',
  'CHIEF_DOCUMENT_APPROVE', 'CHIEF_DOCUMENT_RETURN',
  'CLINICAL_INCIDENT_CREATE', 'CLINICAL_INCIDENT_UPDATE',
  'MEDICAL_COUNCIL_CREATE', 'MEDICAL_COUNCIL_UPDATE', 'MEDICAL_COUNCIL_DECISION',
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
