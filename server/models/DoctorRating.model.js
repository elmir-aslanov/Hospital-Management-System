import mongoose from 'mongoose';

const doctorRatingSchema = new mongoose.Schema(
  {
    doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',      required: true },
    patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',     required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    rating:        { type: Number, required: true, min: 1, max: 5 },
    review:        { type: String, trim: true, maxlength: 500 },
    isAnonymous:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

doctorRatingSchema.index({ doctorId: 1, patientId: 1, appointmentId: 1 });
doctorRatingSchema.index({ doctorId: 1, createdAt: -1 });

const DoctorRating = mongoose.model('DoctorRating', doctorRatingSchema);
export default DoctorRating;
