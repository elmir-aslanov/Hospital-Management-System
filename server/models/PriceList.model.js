import mongoose from 'mongoose';

const priceListSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    serviceCode: { type: String, trim: true, uppercase: true, sparse: true },
    category: {
      type: String,
      enum: ['consultation', 'lab', 'imaging', 'surgery', 'pharmacy', 'room', 'other'],
      required: true,
    },
    price:       { type: Number, required: true, min: 0 },
    currency:    { type: String, default: 'AZN' },
    description: { type: String, trim: true },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

priceListSchema.index({ serviceCode: 1 }, { unique: true, sparse: true });

const PriceList = mongoose.model('PriceList', priceListSchema);
export default PriceList;
