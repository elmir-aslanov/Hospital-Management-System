import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, trim: true, lowercase: true },
  phone:   { type: String, trim: true },
  message: { type: String, required: true, maxlength: 1000 },
  status:  { type: String, enum: ['pending', 'reviewed', 'closed'], default: 'pending' },
  aiResponse: { type: String },
}, { timestamps: true });

export default mongoose.model('Consultation', consultationSchema);
