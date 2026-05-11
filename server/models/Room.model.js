import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    wardId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
    roomNumber: { type: String, required: true, trim: true },
    type:       { type: String, enum: ['single', 'double', 'icu'], default: 'single' },
    floor:      { type: Number },
  },
  { timestamps: true }
);

roomSchema.index({ wardId: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
