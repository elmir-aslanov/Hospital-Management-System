import mongoose from 'mongoose';

const siteDoctorSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true, trim: true },
  specialty:  { type: String, required: true, trim: true },
  department: { type: String, default: '', trim: true },
  experience: { type: Number, default: 0 },
  image:      { type: String, default: '' },
  bio:        { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  order:      { type: Number, default: 0 },
}, { timestamps: true });

siteDoctorSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('SiteDoctor', siteDoctorSchema);
