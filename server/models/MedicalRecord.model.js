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

medicalRecordSchema.pre('save', function(next) {
  if (!this.isNew) {
    const err = new Error('MedicalRecord is append-only and cannot be modified after creation');
    err.status = 403;
    return next(err);
  }
  next();
});

medicalRecordSchema.pre('findOneAndUpdate', function(next) {
  const err = new Error('MedicalRecord is append-only. Create a new record instead.');
  err.status = 403;
  next(err);
});

medicalRecordSchema.pre('updateOne', function(next) {
  const err = new Error('MedicalRecord is append-only. Create a new record instead.');
  err.status = 403;
  next(err);
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
