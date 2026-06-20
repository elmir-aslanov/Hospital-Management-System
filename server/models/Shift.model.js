import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wardId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', default: null },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    shiftType:  { type: String, enum: ['morning', 'afternoon', 'night'], required: true },
    startTime:  { type: String, required: true },
    endTime:    { type: String, required: true },
    breakStartTime: { type: String, default: '' },
    breakEndTime:   { type: String, default: '' },
    date:       { type: Date, required: true },
    // 'scheduled'/'active'/'completed' are the normal lifecycle; 'off',
    // 'vacation', 'sick_leave' mark planned absences; 'cancelled' is the
    // only way a shift is ever removed (no hard-delete).
    status:     { type: String, enum: ['scheduled', 'active', 'completed', 'off', 'vacation', 'sick_leave', 'cancelled'], default: 'scheduled' },
    notes:      { type: String, trim: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

shiftSchema.index({ userId: 1, date: 1 });
shiftSchema.index({ wardId: 1, date: 1 });
shiftSchema.index({ departmentId: 1, date: 1 });

const Shift = mongoose.model('Shift', shiftSchema);
export default Shift;
