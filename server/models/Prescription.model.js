import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true }, // e.g. "3x daily"
  duration: { type: String, required: true },  // e.g. "7 days"
  instructions: { type: String },
  quantity: { type: Number },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    medications: { type: [medicationSchema], required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
