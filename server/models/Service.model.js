import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  slug:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  department:     { type: String, default: '', trim: true },
  description:    { type: String, default: '', trim: true },
  icon:           { type: String, default: '' },
  iconKey:        { type: String, default: '' },
  image:          { type: String, default: '' },
  duration:       { type: String, default: '' },
  resultDuration: { type: String, default: '' },
  category:       { type: String, default: '' },
  order:          { type: Number, default: 0, min: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

serviceSchema.index({ isActive: 1, order: 1 });
serviceSchema.index({ category: 1, isActive: 1 });

export default mongoose.model('Service', serviceSchema);
