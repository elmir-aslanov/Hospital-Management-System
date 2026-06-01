import mongoose from 'mongoose';

const priceListSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    serviceName: { type: String, trim: true },
    serviceCode: { type: String, trim: true, uppercase: true, sparse: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['consultation', 'procedure', 'lab', 'imaging', 'room', 'medication', 'surgery', 'pharmacy', 'other'],
      required: true,
    },
    price:    { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'AZN' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

priceListSchema.index({ serviceCode: 1 }, { unique: true, sparse: true });

const PriceList = mongoose.model('PriceList', priceListSchema);
export default PriceList;
