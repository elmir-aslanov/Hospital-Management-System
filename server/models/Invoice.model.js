import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  serviceCode: { type: String, trim: true },
  quantity:    { type: Number, required: true, min: 1, default: 1 },
  unitPrice:   { type: Number, required: true, min: 0 },
  total:       { type: Number, required: true, min: 0 },
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  visitId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Visit',   default: null },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  issuedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  items:         [invoiceItemSchema],
  subtotal:      { type: Number, required: true, min: 0 },
  discount:      { type: Number, default: 0, min: 0 },
  tax:           { type: Number, default: 0, min: 0 },
  total:         { type: Number, required: true, min: 0 },
  currency:      { type: String, default: 'AZN' },
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'partially_paid', 'cancelled', 'overdue'],
    default: 'draft',
  },
  dueDate:     { type: Date },
  notes:       { type: String, trim: true },
  insuranceId: { type: String, trim: true, default: null },
}, { timestamps: true });

invoiceSchema.pre('save', async function (next) {
  if (this.invoiceNumber) return next();
  const count = await mongoose.model('Invoice').countDocuments();
  this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  next();
});

invoiceSchema.index({ patientId: 1, createdAt: -1 });
invoiceSchema.index({ status: 1 });

export default mongoose.model('Invoice', invoiceSchema);
