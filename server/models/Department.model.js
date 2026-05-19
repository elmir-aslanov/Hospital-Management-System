import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '', trim: true },
  icon:        { type: String, default: '' },
  image:       { type: String, default: '' },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Department', departmentSchema);
