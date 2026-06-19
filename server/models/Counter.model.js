import mongoose from 'mongoose';

// Generic atomic sequence counter — used to generate gapless, race-condition-safe
// numbers (e.g. lab result protocol numbers) via findOneAndUpdate + $inc.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const nextSequence = async (key) => {
  const counter = await mongoose.model('Counter').findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return counter.seq;
};

export default mongoose.model('Counter', counterSchema);
