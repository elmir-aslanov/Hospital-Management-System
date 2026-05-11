import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    patientId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',         required: true },
    doctorId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',          required: true },
    appointmentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment',     default: null },
    chiefComplaint: { type: String, required: true, trim: true },
    diagnosis:      { type: String, trim: true },
    clinicalNotes:  { type: String, trim: true },
    status:         { type: String, enum: ['open', 'closed'], default: 'open' },
    prescriptions:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
    dischargeId:    { type: mongoose.Schema.Types.ObjectId, ref: 'DischargeSummary', default: null },
  },
  { timestamps: true }
);

visitSchema.index({ patientId: 1, createdAt: -1 });
visitSchema.index({ doctorId: 1, status: 1 });

const Visit = mongoose.model('Visit', visitSchema);
export default Visit;
