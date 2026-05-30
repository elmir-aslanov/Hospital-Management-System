import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  invoiceId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  amount:        { type: Number, required: true, min: 0 },
  currency:      { type: String, default: 'AZN' },
  method: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'insurance', 'online'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed',
  },
  transactionId: { type: String, trim: true, default: null },
  note:          { type: String, trim: true },
  receivedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
