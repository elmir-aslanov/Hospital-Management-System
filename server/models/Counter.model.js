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

// Same atomic guarantee as nextSequence, but when the counter document does
// not exist yet it is seeded from the real current maximum (via computeInitialSeq,
// e.g. parsed from existing legacy-numbered documents) instead of starting at 0.
// This avoids re-issuing a number that already exists from before this counter
// was introduced. Safe under concurrent first-use: if two requests race to
// create the counter, the loser falls back to a plain atomic increment.
export const nextSequenceFrom = async (key, computeInitialSeq) => {
  const Counter = mongoose.model('Counter');

  const existing = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true },
  );
  if (existing) return existing.seq;

  const initialSeq = await computeInitialSeq();
  try {
    const created = await Counter.create({ _id: key, seq: initialSeq + 1 });
    return created.seq;
  } catch (err) {
    if (err.code === 11000) {
      const counter = await Counter.findOneAndUpdate(
        { _id: key },
        { $inc: { seq: 1 } },
        { upsert: true, new: true },
      );
      return counter.seq;
    }
    throw err;
  }
};

export default mongoose.model('Counter', counterSchema);
