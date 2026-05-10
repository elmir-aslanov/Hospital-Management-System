import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
    type: {
      type: String,
      enum: ['lab_result', 'imaging', 'clinical_note', 'procedure', 'vaccination', 'other'],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    attachments: [{ type: String }], // Cloudinary URLs
  },
  { timestamps: true }
);

// Append-only — no delete route should be exposed for this model
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
