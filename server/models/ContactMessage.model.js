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
  email:    {
    type: String, trim: true, lowercase: true, default: '',
    required: function () { return this.requestType !== 'home_service'; },
  },
  phone:    { type: String, default: '', trim: true },
  subject:  { type: String, default: '', trim: true },
  message:  {
    type: String, trim: true, default: '',
    required: function () { return this.requestType !== 'home_service'; },
  },

  consentAccepted:   { type: Boolean, default: false },
  consentAcceptedAt: { type: Date },

  status:  { type: String, enum: ['new', 'read', 'replied'], default: 'new' },

  /* ── Home-service test requests ───────────────────────────────────────── */
  requestType:        { type: String, enum: ['contact', 'home_service'], default: 'contact' },
  address:            { type: String, trim: true, default: '' },
  preferredDate:       { type: Date, default: null },
  preferredTimeRange: { type: String, trim: true, default: '' },
  // Trusted snapshot taken from the PriceList record at submission time — never from client input.
  service: {
    priceListId: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceList', default: null },
    name:        { type: String, trim: true, default: '' },
    code:        { type: String, trim: true, default: '' },
    price:       { type: Number, default: null },
    currency:    { type: String, trim: true, default: '' },
  },

  replies: [replySchema],
}, { timestamps: true });

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model('ContactMessage', contactMessageSchema);
