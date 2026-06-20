import mongoose from 'mongoose';

const workScheduleSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },   // "HH:MM"
    endTime: { type: String, required: true },     // "HH:MM"
    breakStartTime: { type: String, default: '' }, // "HH:MM" — optional
    breakEndTime: { type: String, default: '' },   // "HH:MM" — optional
    slotDuration: { type: Number, default: 30, enum: [15, 20, 30, 45, 60] },
    isOff: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workScheduleSchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

const WorkSchedule = mongoose.model('WorkSchedule', workScheduleSchema);
export default WorkSchedule;
