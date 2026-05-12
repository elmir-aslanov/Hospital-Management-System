import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, unique: true, trim: true },
    genericName:   { type: String, trim: true },
    category: {
      type: String,
      enum: ['antibiotic', 'analgesic', 'antihistamine', 'cardiovascular', 'diabetes', 'vitamin', 'other'],
    },
    unit: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops'],
      required: true,
    },
    stock:         { type: Number, required: true, default: 0, min: 0 },
    minStockLevel: { type: Number, default: 10 },
    unitPrice:     { type: Number, required: true, min: 0 },
    manufacturer:  { type: String, trim: true },
    expiryDate:    { type: Date },
    description:   { type: String, trim: true },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 1 }, { unique: true });
medicineSchema.index({ category: 1 });
medicineSchema.index({ stock: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
