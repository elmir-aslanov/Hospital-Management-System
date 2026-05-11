import mongoose from 'mongoose';
import { ADMISSION_STATUS } from '../config/constants.js';

const admissionSchema = new mongoose.Schema(
  {
    patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    bedId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Bed',     required: true },
    wardId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Ward',    required: true },
    admittedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    admissionDate: { type: Date, required: true, default: Date.now },
    dischargeDate: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(ADMISSION_STATUS),
      default: ADMISSION_STATUS.ADMITTED,
    },
    reason: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

admissionSchema.index({ patientId: 1, status: 1 });
admissionSchema.index({ bedId: 1, status: 1 });

const Admission = mongoose.model('Admission', admissionSchema);
export default Admission;
