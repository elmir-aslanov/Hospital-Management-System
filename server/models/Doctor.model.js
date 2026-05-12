import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    experience: { type: Number, min: 0, default: 0 },
    bio: { type: String, trim: true, default: '' },
    isAvailable:    { type: Boolean, default: true },
    averageRating:  { type: Number, default: 0, min: 0, max: 5 },
    totalRatings:   { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
