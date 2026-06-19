import mongoose from 'mongoose';
import { APPOINTMENT_STATUS } from '../config/constants.js';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
    date:      { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime:   { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.SCHEDULED,
    },
    reason:       { type: String, required: true, trim: true },
    notes:        { type: String, trim: true },
    priority:     { type: String, enum: ['routine', 'urgent', 'critical'], default: 'routine' },
    reassignmentHistory: { type: [{
      fromDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
      toDoctorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
      reason:       { type: String, required: true, trim: true, maxlength: 500 },
      reassignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      reassignedAt: { type: Date, default: Date.now },
    }], default: [], validate: v => v.length <= 100 },
    cancelledBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancelReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// Compound index — critical for conflict detection queries
appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1, endTime: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1, priority: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
