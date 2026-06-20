import mongoose from 'mongoose';

const EQUIPMENT_STATUS = [
  'available', 'in_use', 'dirty', 'cleaning', 'sterilizing', 'sterile', 'maintenance', 'retired',
];

const equipmentSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    code:     { type: String, required: true, trim: true, unique: true },
    category: { type: String, trim: true, default: 'instrument' },
    wardId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', default: null },
    status:   { type: String, enum: EQUIPMENT_STATUS, default: 'available' },
    currentCycleId:  { type: mongoose.Schema.Types.ObjectId, ref: 'SterilizationCycle', default: null },
    lastSterilizedAt: { type: Date, default: null },
    sterileExpiresAt: { type: Date, default: null },
    notes:    { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

equipmentSchema.index({ status: 1 });
equipmentSchema.index({ wardId: 1 });

const Equipment = mongoose.model('Equipment', equipmentSchema);
export { EQUIPMENT_STATUS };
export default Equipment;
