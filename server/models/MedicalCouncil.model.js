import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const medicalCouncilSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  clinicalReason: { type: String, required: true, trim: true, maxlength: 2000 },
  priority: { type: String, enum: ['routine','urgent','critical'], default: 'routine' },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }], default: [], validate: v => v.length <= 30 },
  departmentIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }], default: [], validate: v => v.length <= 20 },
  scheduledAt: { type: Date, default: null },
  status: { type: String, enum: ['draft','scheduled','in_progress','completed','cancelled'], default: 'draft' },
  discussionNotes: { type: [discussionSchema], default: [], validate: v => v.length <= 100 },
  finalDecision: { type: String, trim: true, maxlength: 5000, default: '' },
  finalDecisionApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  finalDecisionApprovedAt: { type: Date, default: null },
  attachmentUrls: { type: [{ type: String, trim: true }], default: [], validate: v => v.length <= 50 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

medicalCouncilSchema.index({ status: 1, scheduledAt: 1 });
medicalCouncilSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model('MedicalCouncil', medicalCouncilSchema);
