import mongoose from 'mongoose';

const wardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['general', 'icu', 'emergency', 'maternity', 'pediatric', 'surgical'],
      required: true,
    },
    floor: { type: Number, required: true },
    totalBeds: { type: Number, required: true, min: 1 },
    headNurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const Ward = mongoose.model('Ward', wardSchema);
export default Ward;
