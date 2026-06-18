import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  subject:        { type: String, trim: true, default: '' },
  message:        { type: String, trim: true, required: true },
  repliedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repliedAt:      { type: Date, default: Date.now },
  emailMessageId: { type: String, default: '' },
  deliveryStatus: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  deliveryError:  { type: String, default: '' },
}, { _id: true });

const contactMessageSchema = new mongoose.Schema({
  fullName: { type: String, trim: true, default: '' },
  name:     { type: String, trim: true, default: '' },  // legacy compat
  email:    { type: String, required: true, trim: true, lowercase: true },
  phone:    { type: String, default: '', trim: true },
  subject:  { type: String, default: '', trim: true },
  message:  { type: String, required: true, trim: true },

  consentAccepted:   { type: Boolean, default: false },
  consentAcceptedAt: { type: Date },

  status:  { type: String, enum: ['new', 'read', 'replied'], default: 'new' },

  replies: [replySchema],
}, { timestamps: true });

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model('ContactMessage', contactMessageSchema);
