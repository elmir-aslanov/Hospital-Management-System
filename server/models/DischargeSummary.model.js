import mongoose from 'mongoose';

const dischargeMedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  instructions: { type: String },
}, { _id: false });

const dischargeSummarySchema = new mongoose.Schema(
  {
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    admissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', default: null },
    dischargingDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    admissionDate: { type: Date, required: true },
    dischargeDate: { type: Date, required: true },
    finalDiagnosis: { type: String, required: true, trim: true },
    treatmentSummary: { type: String, required: true, trim: true },
    dischargeMedications: [dischargeMedSchema],
    followUpDate: { type: Date },
    followUpInstructions: { type: String, trim: true },
    pdfUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const DischargeSummary = mongoose.model('DischargeSummary', dischargeSummarySchema);
export default DischargeSummary;
