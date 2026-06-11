import mongoose from 'mongoose';
import { BLOG_CATEGORY_SLUGS } from '../config/blogCategories.js';

const toSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/ə/g,'e').replace(/ı/g,'i').replace(/ö/g,'o')
    .replace(/ü/g,'u').replace(/ç/g,'c').replace(/ş/g,'s')
    .replace(/ğ/g,'g').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const WORDS_PER_MINUTE = 200;
export const calcReadTime = (content) => {
  const words = (content || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

const blogSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true, trim: true },
  content:     { type: String, required: true },
  excerpt:     { type: String, trim: true },
  coverImage:  { type: String, default: '' },
  category:    { type: String, trim: true, enum: BLOG_CATEGORY_SLUGS },
  author:      { type: String, trim: true, default: 'Aslan Medical Center' },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  tags:        [{ type: String, trim: true }],
  readTime:    { type: Number },
  status:      { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  views:       { type: Number, default: 0 },
}, { timestamps: true });

blogSchema.pre('save', async function (next) {
  if (!this.slug && this.title) {
    const base = toSlug(this.title);
    let slug = base;
    let i = 2;
    const Blog = mongoose.model('Blog');
    while (await Blog.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${i++}`;
    }
    this.slug = slug;
  }

  if (this.isModified('content') || !this.readTime) {
    this.readTime = calcReadTime(this.content);
  }

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

export default mongoose.model('Blog', blogSchema);
