import mongoose from 'mongoose';
import { BED_STATUS } from '../config/constants.js';

const bedSchema = new mongoose.Schema(
  {
    roomId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room',    required: true },
    wardId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Ward',    required: true },
    bedNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(BED_STATUS),
      default: BED_STATUS.AVAILABLE,
    },
    currentPatientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  },
  { timestamps: true }
);

bedSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });
bedSchema.index({ wardId: 1, status: 1 });

const Bed = mongoose.model('Bed', bedSchema);
export default Bed;
