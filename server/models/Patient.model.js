import mongoose from 'mongoose';

const medicalHistorySchema = new mongoose.Schema(
  {
    condition: { type: String, required: true, trim: true },
    diagnosedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    patientId: { type: String, unique: true, sparse: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }],
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },
    medicalHistory: [medicalHistorySchema],
  },
  { timestamps: true }
);

patientSchema.pre('save', async function (next) {
  if (this.patientId) return next();
  const count = await mongoose.model('Patient').countDocuments();
  this.patientId = `P-${String(count + 1).padStart(4, '0')}`;
  next();
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
