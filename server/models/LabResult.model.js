import mongoose from 'mongoose';
import { nextSequence } from './Counter.model.js';

const resultItemSchema = new mongoose.Schema({
  testName:       { type: String, required: true, trim: true, maxlength: 150 },
  testCode:       { type: String, trim: true, maxlength: 40 },
  value:          { type: String, required: true, trim: true, maxlength: 200 },
  unit:           { type: String, trim: true, maxlength: 40 },
  referenceRange: { type: String, trim: true, maxlength: 100 },
  status:         { type: String, enum: ['normal','low','high','critical','pending'], default: 'normal' },
  notes:          { type: String, trim: true, maxlength: 500 },
}, { _id: true });

const labResultSchema = new mongoose.Schema({
  // ── Legacy order-linked flow (doctor-prescribed LabOrder → lab tech enters result) ──
  labOrderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'LabOrder', default: null },
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',  default: null },
  performedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',     default: null },
  verifiedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     default: null },
  results:       [resultItemSchema],
  summary:       { type: String, trim: true, maxlength: 2000 },
  isVerified:    { type: Boolean, default: false },
  verifiedAt:    { type: Date, default: null },
  attachmentUrl: { type: String, default: null },

  // ── Standalone certified result (lab tech publishes a verifiable analysis report) ──
  protocolNo:        { type: String, trim: true, default: null },
  patientFullName:   { type: String, trim: true, maxlength: 150, default: '' },
  patientFin:        { type: String, trim: true, uppercase: true, maxlength: 8, default: '' },
  patientBirthDate:  { type: Date, default: null },
  sampleDate:        { type: Date, default: null },
  resultDate:        { type: Date, default: null },
  doctorName:        { type: String, trim: true, maxlength: 150, default: '' },
  departmentName:    { type: String, trim: true, maxlength: 150, default: '' },
  testName:          { type: String, trim: true, maxlength: 150, default: '' },
  testCode:          { type: String, trim: true, maxlength: 40,  default: '' },
  generalConclusion: { type: String, trim: true, maxlength: 2000, default: '' },
  labTechnicianId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt:        { type: Date, default: null },
  status:            { type: String, enum: ['draft','completed','approved','cancelled'], default: 'completed' },
  isPublicVisible:   { type: Boolean, default: false },
}, { timestamps: true });

labResultSchema.pre('save', async function (next) {
  if (this.protocolNo || this.labOrderId) return next();
  try {
    const year = new Date().getFullYear();
    const seq = await nextSequence(`labResultProtocol-${year}`);
    this.protocolNo = `LAB-${year}-${String(seq).padStart(6, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

labResultSchema.index({ patientId: 1, createdAt: -1 });
labResultSchema.index({ labOrderId: 1 }, { unique: true, sparse: true });
labResultSchema.index({ protocolNo: 1 }, { unique: true, sparse: true });
labResultSchema.index({ patientFin: 1, protocolNo: 1 });
labResultSchema.index({ patientBirthDate: 1, protocolNo: 1 });
labResultSchema.index({ status: 1, isPublicVisible: 1 });

export default mongoose.model('LabResult', labResultSchema);
