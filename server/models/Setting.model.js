import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  group: { type: String, default: 'general', trim: true },
  label: { type: String, trim: true },
}, { timestamps: true });

settingSchema.index({ group: 1 });

export default mongoose.model('Setting', settingSchema);
