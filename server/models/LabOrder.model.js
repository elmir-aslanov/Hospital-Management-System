import mongoose from 'mongoose';

const labOrderSchema = new mongoose.Schema({
  orderNumber:   { type: String, unique: true },
  protocolNo:    { type: String, trim: true },
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',     required: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',      required: true },
  visitId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Visit',       default: null },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  tests: [{
    testName: { type: String, required: true, trim: true },
    testCode: { type: String, trim: true },
    category: { type: String, enum: ['hematology','biochemistry','microbiology','imaging','urine','other'], default: 'other' },
    urgency:  { type: String, enum: ['routine','urgent','stat'], default: 'routine' },
    notes:    { type: String, trim: true },
  }],
  status: {
    type: String,
    enum: ['pending','sample_collected','processing','completed','cancelled'],
    default: 'pending',
  },
  priority:    { type: String, enum: ['routine','urgent','stat'], default: 'routine' },
  orderedAt:   { type: Date, default: Date.now },
  notes:       { type: String, trim: true },
  completedAt: { type: Date, default: null },
  resultPdf:   { type: String, default: null },
}, { timestamps: true });

labOrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('LabOrder').countDocuments();
    this.orderNumber = `LAB-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }

  if (!this.protocolNo) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('LabOrder').countDocuments({ protocolNo: new RegExp(`^${year}-`) });
    this.protocolNo = `${year}-${String(count + 1).padStart(6, '0')}`;
  }

  next();
});

labOrderSchema.index({ patientId: 1, createdAt: -1 });
labOrderSchema.index({ status: 1 });
labOrderSchema.index({ doctorId: 1 });
labOrderSchema.index({ protocolNo: 1 }, { unique: true, sparse: true });

export default mongoose.model('LabOrder', labOrderSchema);
