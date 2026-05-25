import mongoose from 'mongoose';

const muracietSchema = new mongoose.Schema({
  ad:     { type: String, required: true, trim: true },
  soyad:  { type: String, required: true, trim: true },
  ataAdi: { type: String, required: true, trim: true },
  epoct:  { type: String, required: true, trim: true },
  telefon:{ type: String, required: true, trim: true },
  unvan:  { type: String, required: true, trim: true },
  metn:   { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model('Muraciet', muracietSchema);
