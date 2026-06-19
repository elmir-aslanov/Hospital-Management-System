import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const clinicalIncidentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  type: { type: String, enum: ['critical_lab','urgent_appointment','critical_patient_note','unanswered_alert','council_required','other'], required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  responsibleDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  sourceType: { type: String, enum: ['LabResult','Appointment','EHR','MedicalCouncil','Manual'], default: 'Manual' },
  sourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  priority: { type: String, enum: ['high','critical'], default: 'high' },
  status: { type: String, enum: ['open','reviewing','resolved'], default: 'open' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  notes: { type: [noteSchema], default: [], validate: v => v.length <= 100 },
}, { timestamps: true });

clinicalIncidentSchema.index({ status: 1, priority: 1, createdAt: -1 });
clinicalIncidentSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model('ClinicalIncident', clinicalIncidentSchema);
