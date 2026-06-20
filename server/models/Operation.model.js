import mongoose from 'mongoose';

const operationSchema = new mongoose.Schema(
  {
    patientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    surgeonId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
    assistingDoctorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    anesthesiologistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },

    procedureName: { type: String, required: true, trim: true },
    room:          { type: String, trim: true, default: '' },
    priority:      { type: String, enum: ['elective', 'urgent', 'emergency'], default: 'elective' },

    date:          { type: Date, required: true },
    startTime:     { type: String, required: true },
    estimatedDurationMinutes: { type: Number, required: true, min: 5 },

    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'postponed', 'cancelled'],
      default: 'scheduled',
    },

    preOpNotes:    { type: String, trim: true, default: '' },
    postOpNotes:   { type: String, trim: true, default: '' },
    cancelReason:  { type: String, trim: true, default: '' },
    postponeReason: { type: String, trim: true, default: '' },

    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

operationSchema.index({ surgeonId: 1, date: 1 });
operationSchema.index({ patientId: 1, date: -1 });
operationSchema.index({ status: 1, date: 1 });

const Operation = mongoose.model('Operation', operationSchema);
export default Operation;
