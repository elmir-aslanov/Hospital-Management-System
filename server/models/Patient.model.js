import mongoose from 'mongoose';

const medicalHistorySchema = new mongoose.Schema({
  condition: { type: String, required: true },
  diagnosedAt: { type: Date },
  notes: { type: String },
}, { _id: false });

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: String, unique: true }, // auto-generated: P-0001
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    medicalHistory: [medicalHistorySchema],
  },
  { timestamps: true }
);

// Auto-generate P-XXXX patientId before first save
patientSchema.pre('save', async function (next) {
  if (this.patientId) return next();

  const count = await mongoose.model('Patient').countDocuments();
  this.patientId = `P-${String(count + 1).padStart(4, '0')}`;
  next();
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
