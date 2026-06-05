import mongoose from 'mongoose';

const ehrSchema = new mongoose.Schema({
  patientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  type:        { type: String, enum: ['diagnosis','procedure','allergy','note','lab','prescription','vaccination'], default: 'note' },
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  date:        { type: Date, default: Date.now },
  isActive:    { type: Boolean, default: true },
  attachments: [{ name: String, url: String }],
}, { timestamps: true });

ehrSchema.index({ patientId: 1, date: -1 });
ehrSchema.index({ patientId: 1, type: 1 });

export default mongoose.model('EHR', ehrSchema);
