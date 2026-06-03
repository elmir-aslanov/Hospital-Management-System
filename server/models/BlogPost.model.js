import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt:     { type: String, default: '', trim: true },
  content:     { type: String, default: '', trim: true },
  image:       { type: String, default: '' },
  author:      { type: String, default: 'Aslan Medical Center', trim: true },
  category:    { type: String, default: 'Xəbərlər', trim: true },
  tags:        [{ type: String, trim: true }],
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  views:       { type: Number, default: 0 },
}, { timestamps: true });

blogPostSchema.index({ isPublished: 1, publishedAt: -1 });

export default mongoose.model('BlogPost', blogPostSchema);
