import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    // Nullable — anonymous public submissions have neither set.
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isAnonymous: { type: Boolean, default: false },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 150, default: '' },
    contactPhone: { type: String, trim: true, maxlength: 30, default: '' },

    category: {
      type: String,
      enum: ['feedback', 'complaint', 'suggestion', 'service_quality', 'doctor_related', 'lab_related', 'billing_related'],
      default: 'feedback',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status:   { type: String, enum: ['new', 'in_review', 'resolved', 'rejected', 'closed'], default: 'new' },

    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },

    adminResponse: { type: String, trim: true, maxlength: 3000, default: '' },
    respondedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    respondedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

feedbackSchema.index({ patientId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, priority: 1 });

export default mongoose.model('Feedback', feedbackSchema);
