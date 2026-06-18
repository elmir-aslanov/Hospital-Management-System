import mongoose from 'mongoose';

const priceListSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    serviceName: { type: String, trim: true },
    serviceCode: { type: String, trim: true, uppercase: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['consultation', 'procedure', 'lab', 'imaging', 'room', 'medication', 'surgery', 'pharmacy', 'other'],
      required: true,
    },
    price:    { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'AZN' },
    serviceSlug: { type: String, trim: true, lowercase: true, default: '' },
    serviceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null },
    isActive: { type: Boolean, default: true },

    /* ── Optional dynamic detail-page content (admin-editable, public detail page) ── */
    about: { type: String, trim: true, default: '' },
    technicalDetails: {
      department:        { type: String, trim: true, default: '' },
      method:             { type: String, trim: true, default: '' },
      transport:          { type: String, trim: true, default: '' },
      turnaround:         { type: String, trim: true, default: '' },
      sampleVolume:       { type: String, trim: true, default: '' },
      sampleType:         { type: String, trim: true, default: '' },
      rejectionCriteria:  { type: String, trim: true, default: '' },
      synonyms:           { type: String, trim: true, default: '' },
      preparation:        { type: String, trim: true, default: '' },
      tube:               { type: String, trim: true, default: '' },
    },
    // Free-text reference/interpretation guidance — never auto-generated numeric limits.
    referenceInfo:        { type: String, trim: true, default: '' },
    homeServiceAvailable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

priceListSchema.index({ serviceCode: 1 }, { unique: true, sparse: true });
priceListSchema.index({ serviceSlug: 1, isActive: 1 });
priceListSchema.index({ serviceId: 1,   isActive: 1 });

const PriceList = mongoose.model('PriceList', priceListSchema);
export default PriceList;
