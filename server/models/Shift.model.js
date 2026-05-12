import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wardId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', default: null },
    shiftType:  { type: String, enum: ['morning', 'afternoon', 'night'], required: true },
    startTime:  { type: String, required: true },
    endTime:    { type: String, required: true },
    date:       { type: Date, required: true },
    status:     { type: String, enum: ['scheduled', 'active', 'completed', 'cancelled'], default: 'scheduled' },
    notes:      { type: String, trim: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

shiftSchema.index({ userId: 1, date: 1 });
shiftSchema.index({ wardId: 1, date: 1 });

const Shift = mongoose.model('Shift', shiftSchema);
export default Shift;
