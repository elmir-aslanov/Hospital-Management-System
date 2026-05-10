import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    wardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
    roomNumber: { type: String, required: true, trim: true },
    type: { type: String, enum: ['single', 'double', 'icu', 'general'], required: true },
    floor: { type: Number, required: true },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
