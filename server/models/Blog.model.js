import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  content:     { type: String, required: true },
  excerpt:     { type: String, trim: true },
  coverImage:  { type: String },
  category:    { type: String, trim: true },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags:        [{ type: String, trim: true }],
  readTime:    { type: Number, default: 5 },
  isPublished: { type: Boolean, default: false },
  views:       { type: Number, default: 0 },
}, { timestamps: true });

blogSchema.pre('save', function (next) {
  if (this.title) this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  next();
});

export default mongoose.model('Blog', blogSchema);
