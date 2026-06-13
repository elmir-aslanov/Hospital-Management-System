import mongoose from 'mongoose';

const toSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/ə/g,'e').replace(/ı/g,'i').replace(/ö/g,'o')
    .replace(/ü/g,'u').replace(/ç/g,'c').replace(/ş/g,'s')
    .replace(/ğ/g,'g').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const contentSectionSchema = new mongoose.Schema({
  title: { type: String, default: '', trim: true },
  body:  { type: String, default: '', trim: true },
}, { _id: false });

const departmentSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true, trim: true, sparse: true },
  description: { type: String, default: '', trim: true },
  contentSections: { type: [contentSectionSchema], default: [] },
  icon:        { type: String, default: '' },
  image:       { type: String, default: '' },
  phone:       { type: String, default: '', trim: true },
  fax:         { type: String, default: '', trim: true },
  room:        { type: String, default: '', trim: true },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.pre('save', async function(next) {
  if (!this.slug && this.name) {
    let base = toSlug(this.name);
    let slug = base;
    let i = 1;
    const Dept = mongoose.model('Department');
    while (await Dept.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${i++}`;
    }
    this.slug = slug;
  }
  next();
});

departmentSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Department', departmentSchema);
