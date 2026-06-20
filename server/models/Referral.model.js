import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    patientId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    referringDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
    referredToDoctorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',     default: null },
    referredToDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },

    reason:         { type: String, required: true, trim: true },
    clinicalNotes:  { type: String, trim: true, default: '' },
    urgency:        { type: String, enum: ['routine', 'urgent', 'emergency'], default: 'routine' },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'pending',
    },
    declineReason:     { type: String, trim: true, default: '' },
    consultationNotes: { type: String, trim: true, default: '' },
    appointmentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

referralSchema.index({ patientId: 1, createdAt: -1 });
referralSchema.index({ referringDoctorId: 1, status: 1 });
referralSchema.index({ referredToDoctorId: 1, status: 1 });

referralSchema.pre('validate', function requireTarget(next) {
  if (!this.referredToDoctorId && !this.referredToDepartmentId) {
    return next(new Error('Either referredToDoctorId or referredToDepartmentId is required'));
  }
  next();
});

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
