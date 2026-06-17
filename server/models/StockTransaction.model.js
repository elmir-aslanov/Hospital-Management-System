import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    medicineId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine',     required: true },
    type:           { type: String, enum: ['stock_in', 'stock_out', 'adjustment'], required: true },
    quantity:       { type: Number, required: true, min: 1 },
    previousStock:  { type: Number, required: true },
    newStock:       { type: Number, required: true },
    reason:         { type: String, required: true, trim: true },
    performedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', default: null },
  },
  { timestamps: true }
);

stockTransactionSchema.index({ medicineId: 1, createdAt: -1 });

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);
export default StockTransaction;
