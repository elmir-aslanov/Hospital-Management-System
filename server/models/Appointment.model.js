import mongoose from 'mongoose';
import { APPOINTMENT_STATUS } from '../config/constants.js';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },   // HH:mm
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
    },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Critical for conflict detection queries
appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1, endTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
