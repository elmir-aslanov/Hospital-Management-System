import mongoose from 'mongoose';

const medicalCertificateSchema = new mongoose.Schema(
  {
    patientId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
    visitId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Visit',   required: true },
    certificateNumber: { type: String, unique: true },
    type: {
      type: String,
      enum: ['sick_leave', 'fitness', 'specialist_referral', 'medical_report'],
      required: true,
    },
    purpose:         { type: String, required: true, trim: true },
    diagnosis:       { type: String, trim: true },
    recommendations: { type: String, trim: true },
    validFrom:       { type: Date, required: true },
    validUntil:      { type: Date },
    issuedAt:        { type: Date, default: Date.now },
    pdfUrl:          { type: String, default: null },
  },
  { timestamps: true }
);

medicalCertificateSchema.pre('save', async function (next) {
  if (this.certificateNumber) return next();
  const year  = new Date().getFullYear();
  const count = await mongoose.model('MedicalCertificate').countDocuments();
  this.certificateNumber = `MC-${year}-${String(count + 1).padStart(4, '0')}`;
  next();
});

const MedicalCertificate = mongoose.model('MedicalCertificate', medicalCertificateSchema);
export default MedicalCertificate;
