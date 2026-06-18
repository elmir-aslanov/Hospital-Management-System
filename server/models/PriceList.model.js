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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

priceListSchema.index({ serviceCode: 1 }, { unique: true, sparse: true });
priceListSchema.index({ serviceSlug: 1, isActive: 1 });

const PriceList = mongoose.model('PriceList', priceListSchema);
export default PriceList;
