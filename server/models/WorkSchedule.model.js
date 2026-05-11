import mongoose from 'mongoose';

const workScheduleSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },   // "HH:MM"
    endTime: { type: String, required: true },     // "HH:MM"
    slotDuration: { type: Number, default: 30 },  // minutes
    isOff: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workScheduleSchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

const WorkSchedule = mongoose.model('WorkSchedule', workScheduleSchema);
export default WorkSchedule;
