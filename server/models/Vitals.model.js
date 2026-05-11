import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema(
  {
    patientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    visitId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Visit',   required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    bloodPressure: {
      systolic:  { type: Number },
      diastolic: { type: Number },
    },
    heartRate:         { type: Number },
    temperature:       { type: Number },
    weight:            { type: Number },
    height:            { type: Number },
    oxygenSaturation:  { type: Number },
    respiratoryRate:   { type: Number },
    bmi:               { type: Number },
    notes:             { type: String, trim: true },
    recordedAt:        { type: Date, default: Date.now },
  },
  { timestamps: true }
);

vitalsSchema.index({ patientId: 1, recordedAt: -1 });
vitalsSchema.index({ visitId: 1 });

vitalsSchema.pre('save', function (next) {
  if (this.weight && this.height && this.height > 0) {
    const heightM = this.height / 100;
    this.bmi = Math.round((this.weight / (heightM * heightM)) * 100) / 100;
  }
  next();
});

const Vitals = mongoose.model('Vitals', vitalsSchema);
export default Vitals;
