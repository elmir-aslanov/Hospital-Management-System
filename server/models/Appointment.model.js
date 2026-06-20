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

    // Check-in / queue workflow — connects the booking record to the actual
    // clinic visit. All optional/additive: existing appointments simply have
    // these unset until they go through check-in.
    checkedInAt:           { type: Date, default: null },
    checkedInBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    queueNumber:           { type: Number, default: null },
    consultationStartedAt: { type: Date, default: null },
    completedAt:           { type: Date, default: null },

    // Reminder tracking — additive/optional, unset on existing appointments
    // until the reminder scan claims them. Presence of a timestamp is the
    // de-duplication guard (see appointments.service.js scanAndSendReminders).
    reminder24hSentAt: { type: Date, default: null },
    reminder2hSentAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound index — critical for conflict detection queries
appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1, endTime: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1, priority: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
