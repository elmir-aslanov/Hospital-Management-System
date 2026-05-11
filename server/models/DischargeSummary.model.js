import mongoose from 'mongoose';

const dischargeMedSchema = new mongoose.Schema(
  {
    name:         { type: String, trim: true },
    dosage:       { type: String, trim: true },
    instructions: { type: String, trim: true },
  },
  { _id: false }
);

const dischargeSummarySchema = new mongoose.Schema(
  {
    visitId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Visit',     required: true, unique: true },
    patientId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',   required: true },
    admissionId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', default: null },
    dischargingDoctor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',    required: true },
    admissionDate:       { type: Date },
    dischargeDate:       { type: Date, required: true, default: Date.now },
    finalDiagnosis:      { type: String, required: true, trim: true },
    treatmentSummary:    { type: String, required: true, trim: true },
    dischargeMedications: [dischargeMedSchema],
    followUpDate:        { type: Date },
    followUpInstructions: { type: String, trim: true },
    pdfUrl:              { type: String, default: null },
  },
  { timestamps: true }
);

const DischargeSummary = mongoose.model('DischargeSummary', dischargeSummarySchema);
export default DischargeSummary;
