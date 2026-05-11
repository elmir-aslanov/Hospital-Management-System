import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    dosage:       { type: String, required: true, trim: true },
    frequency:    { type: String, required: true, trim: true },
    duration:     { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    quantity:     { type: Number, min: 1 },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    visitId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Visit',   required: true },
    patientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
    medications:  { type: [medicationSchema], required: true },
    notes:        { type: String, trim: true },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ visitId: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
