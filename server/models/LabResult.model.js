import mongoose from 'mongoose';

const resultItemSchema = new mongoose.Schema({
  testName:       { type: String, required: true, trim: true },
  testCode:       { type: String, trim: true },
  value:          { type: String, required: true, trim: true },
  unit:           { type: String, trim: true },
  referenceRange: { type: String, trim: true },
  status:         { type: String, enum: ['normal','low','high','critical'], default: 'normal' },
  notes:          { type: String, trim: true },
}, { _id: true });

const labResultSchema = new mongoose.Schema({
  labOrderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'LabOrder', required: true, unique: true },
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',  required: true },
  performedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  verifiedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     default: null },
  results:       [resultItemSchema],
  summary:       { type: String, trim: true },
  isVerified:    { type: Boolean, default: false },
  verifiedAt:    { type: Date, default: null },
  attachmentUrl: { type: String, default: null },
}, { timestamps: true });

labResultSchema.index({ patientId: 1, createdAt: -1 });
labResultSchema.index({ labOrderId: 1 });

export default mongoose.model('LabResult', labResultSchema);
