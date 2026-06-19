import mongoose from 'mongoose';
import { nextSequence, nextSequenceFrom } from './Counter.model.js';

const labOrderSchema = new mongoose.Schema({
  orderNumber:   { type: String, unique: true, sparse: true },
  protocolNo:    { type: String, trim: true },
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',     required: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',      default: null },
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
    enum: ['pending','confirmed','sample_collected','processing','completed','approved','cancelled'],
    default: 'pending',
  },
  priority:    { type: String, enum: ['routine','urgent','stat'], default: 'routine' },
  orderedAt:   { type: Date, default: Date.now },
  notes:       { type: String, trim: true },
  completedAt: { type: Date, default: null },
  resultPdf:   { type: String, default: null },

  /* ── Public self-request flow (patient books their own sample collection) ── */
  source:            { type: String, enum: ['doctor_referral', 'public_self_request'], default: 'doctor_referral' },
  requestNumber:     { type: String, trim: true, default: null },
  priceListId:       { type: mongoose.Schema.Types.ObjectId, ref: 'PriceList', default: null },
  branchName:        { type: String, trim: true, default: '' },
  preferredDate:     { type: Date, default: null },
  preferredTime:     { type: String, trim: true, default: '' },
  patientNote:       { type: String, trim: true, default: '' },
  confirmedAt:        { type: Date, default: null },
  sampleCollectedAt:  { type: Date, default: null },
  sampleCollectedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

labOrderSchema.pre('save', async function (next) {
  if (this.source === 'public_self_request') {
    if (!this.requestNumber) {
      const year = new Date().getFullYear();
      const seq = await nextSequence(`labRequestNumber-${year}`);
      this.requestNumber = `LAB-REQ-${year}-${String(seq).padStart(6, '0')}`;
    }
    return next();
  }

  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const seq = await nextSequenceFrom(`labOrderNumber-${year}`, async () => {
      const prefix = `LAB-REQ-${year}-`;
      const docs = await mongoose.model('LabOrder')
        .find({ orderNumber: new RegExp(`^${prefix}`) })
        .select('orderNumber')
        .lean();
      return docs.reduce((max, d) => {
        const n = parseInt(String(d.orderNumber).slice(prefix.length), 10);
        return Number.isFinite(n) && n > max ? n : max;
      }, 0);
    });
    this.orderNumber = `LAB-REQ-${year}-${String(seq).padStart(6, '0')}`;
  }

  next();
});

labOrderSchema.index({ patientId: 1, createdAt: -1 });
labOrderSchema.index({ status: 1 });
labOrderSchema.index({ doctorId: 1 });
labOrderSchema.index({ protocolNo: 1 }, { unique: true, sparse: true });
labOrderSchema.index({ requestNumber: 1 }, { unique: true, sparse: true });
labOrderSchema.index({ source: 1, branchName: 1, preferredDate: 1 });

export default mongoose.model('LabOrder', labOrderSchema);
