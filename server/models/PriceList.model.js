import mongoose from 'mongoose';

const priceListSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true, trim: true },
    serviceCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: {
      type: String,
      enum: ['consultation', 'procedure', 'lab', 'imaging', 'room', 'medication', 'other'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'AZN' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

priceListSchema.index({ serviceCode: 1 }, { unique: true });

const PriceList = mongoose.model('PriceList', priceListSchema);
export default PriceList;
