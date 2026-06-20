import mongoose from 'mongoose';

const ehrSchema = new mongoose.Schema({
  patientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  type:        { type: String, enum: ['diagnosis','procedure','allergy','note','lab','prescription','vaccination','medical_certificate','epicrisis','consultation_opinion','operation_protocol','lab_summary','other'], default: 'note' },
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  date:        { type: Date, default: Date.now },
  isActive:    { type: Boolean, default: true },
  attachments: [{ name: String, url: String }],
  approvalStatus: { type: String, enum: ['draft','submitted','approved','returned','archived'], default: 'draft' },
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt:     { type: Date, default: null },
  returnReason:   { type: String, trim: true, maxlength: 1000, default: '' },
  submittedAt:    { type: Date, default: null },
  archivedAt:     { type: Date, default: null },
  archivedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

ehrSchema.index({ patientId: 1, date: -1 });
ehrSchema.index({ patientId: 1, type: 1 });
ehrSchema.index({ approvalStatus: 1, createdAt: -1 });

export default mongoose.model('EHR', ehrSchema);
