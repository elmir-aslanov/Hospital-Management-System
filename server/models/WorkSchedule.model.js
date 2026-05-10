import mongoose from 'mongoose';

const workScheduleSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sunday, 6=Saturday
    startTime: { type: String, required: true }, // HH:mm format
    endTime: { type: String, required: true },
    slotDuration: { type: Number, default: 30 }, // minutes per appointment slot
    isOff: { type: Boolean, default: false }, // true = day off
  },
  { timestamps: true }
);

workScheduleSchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

const WorkSchedule = mongoose.model('WorkSchedule', workScheduleSchema);
export default WorkSchedule;
