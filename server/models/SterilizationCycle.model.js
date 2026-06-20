import mongoose from 'mongoose';

const sterilizationCycleSchema = new mongoose.Schema(
  {
    equipmentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    batchNumber:  { type: String, required: true, unique: true },
    method:       { type: String, enum: ['autoclave', 'chemical', 'dry_heat', 'ethylene_oxide'], required: true },
    status:       { type: String, enum: ['in_progress', 'completed', 'failed'], default: 'in_progress' },
    startedAt:    { type: Date, required: true, default: Date.now },
    completedAt:  { type: Date, default: null },
    performedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes:        { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

sterilizationCycleSchema.index({ equipmentId: 1, createdAt: -1 });

const SterilizationCycle = mongoose.model('SterilizationCycle', sterilizationCycleSchema);
export default SterilizationCycle;
