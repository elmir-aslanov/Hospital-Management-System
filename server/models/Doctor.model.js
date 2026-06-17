import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    experience: { type: Number, min: 0, default: 0 },
    bio: { type: String, trim: true, default: '' },
    isAvailable:    { type: Boolean, default: true },
    averageRating:   { type: Number, default: 0, min: 0, max: 5 },
    totalRatings:    { type: Number, default: 0, min: 0 },
    department:      { type: String, trim: true, default: '' },
    departmentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    image:           { type: String, default: '' },
    imagePublicId:   { type: String, default: '' },
    order:           { type: Number, default: 0, min: 0 },
    isActive:        { type: Boolean, default: true },
    consultationFee: { type: Number, default: 0, min: 0 },
    languages:       [{ type: String, trim: true }],
    academicTitle:   { type: String, trim: true, default: '' },
    activityAreas:   [{ type: String, trim: true }],
    education:       [{ type: String, trim: true }],
    publications:    [{ type: String, trim: true }],
    courses:         [{ type: String, trim: true }],
    memberships:     [{ type: String, trim: true }],
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isActive: 1, order: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ departmentId: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
