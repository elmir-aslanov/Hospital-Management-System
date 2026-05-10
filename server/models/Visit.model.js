import mongoose from 'mongoose';
import { VISIT_STATUS } from '../config/constants.js';

const visitSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    chiefComplaint: { type: String, required: true, trim: true },
    diagnosis: { type: String, trim: true },
    clinicalNotes: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(VISIT_STATUS),
      default: VISIT_STATUS.OPEN,
    },
    prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
    dischargeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DischargeSummary', default: null },
  },
  { timestamps: true }
);

const Visit = mongoose.model('Visit', visitSchema);
export default Visit;
