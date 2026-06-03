import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '', trim: true },
  icon:        { type: String, default: '' },
  image:       { type: String, default: '' },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.index({ isActive: 1, order: 1 });

const toSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ö/g, 'o')
    .replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's')
    .replace(/ğ/g, 'g').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

departmentSchema.pre('save', async function (next) {
  if (!this.slug && this.name) {
    let base = toSlug(this.name);
    let slug = base;
    let i = 1;
    while (await mongoose.model('Department').exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${i++}`;
    }
    this.slug = slug;
  }
  next();
});

export default mongoose.model('Department', departmentSchema);
