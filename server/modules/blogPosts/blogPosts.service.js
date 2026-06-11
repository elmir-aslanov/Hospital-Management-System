import Blog from '../../models/Blog.model.js';
import ApiError from '../../utils/ApiError.js';
import { uploadImageBuffer } from '../../config/cloudinary.js';
import { BLOG_CATEGORY_SLUGS } from '../../config/blogCategories.js';

const REVIEWER_POPULATE = {
  path: 'reviewedBy',
  select: 'specialization userId',
  populate: { path: 'userId', select: 'fullName name surname' },
};

export const getAll = async ({ page = 1, limit = 9, category, search, sort } = {}) => {
  const pg  = Math.max(1, parseInt(page) || 1);
  const lim = Math.min(50, Math.max(1, parseInt(limit) || 9));
  const skip = (pg - 1) * lim;

  const filter = { status: 'published' };
  if (category) filter.category = category;
  if (search)   filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { excerpt: { $regex: search, $options: 'i' } },
  ];

  const sortOrder = sort === 'views'
    ? { views: -1, publishedAt: -1, createdAt: -1 }
    : { publishedAt: -1, createdAt: -1 };

  const [data, total] = await Promise.all([
    Blog.find(filter)
      .populate(REVIEWER_POPULATE)
      .sort(sortOrder)
      .skip(skip)
      .limit(lim)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  return { data, total, page: pg, pages: Math.ceil(total / lim) || 1 };
};

export const getAdminAll = async ({ page = 1, limit = 20, category, search, status } = {}) => {
  const pg  = Math.max(1, parseInt(page) || 1);
  const lim = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pg - 1) * lim;

  const filter = {};
  if (category) filter.category = category;
  if (status)   filter.status = status;
  if (search)   filter.title = { $regex: search, $options: 'i' };

  const [data, total] = await Promise.all([
    Blog.find(filter)
      .populate(REVIEWER_POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  return { data, total, page: pg, pages: Math.ceil(total / lim) || 1 };
};

export const getOne = async (slug) => {
  const post = await Blog.findOneAndUpdate(
    { slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate(REVIEWER_POPULATE)
    .lean();
  if (!post) throw new ApiError(404, 'Post not found');
  return post;
};

export const create = async (data, authorId) => {
  if (data.category && !BLOG_CATEGORY_SLUGS.includes(data.category)) {
    throw new ApiError(400, 'Invalid category');
  }
  if (data.reviewedBy === '') data.reviewedBy = null;

  const { readTime, ...rest } = data;
  const payload = {
    ...rest,
    excerpt: data.excerpt?.trim() || (data.content || '').slice(0, 200),
  };
  return Blog.create(payload);
};

export const update = async (id, data) => {
  if (data.category && !BLOG_CATEGORY_SLUGS.includes(data.category)) {
    throw new ApiError(400, 'Invalid category');
  }
  if (data.excerpt === '') delete data.excerpt;
  if (data.reviewedBy === '') data.reviewedBy = null;
  delete data.readTime;

  const doc = await Blog.findById(id);
  if (!doc) throw new ApiError(404, 'Post not found');

  Object.assign(doc, data);

  if (doc.status === 'published' && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }

  await doc.save();
  return doc;
};

export const remove = async (id) => {
  const doc = await Blog.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Post not found');
};

export const uploadCover = async (id, file) => {
  if (!file) throw new ApiError(400, 'Image file is required');
  const post = await Blog.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  const result = await uploadImageBuffer(file.buffer, {
    folder: 'hms/blog',
    transformation: [{ width: 1600, height: 900, crop: 'fill' }],
  });

  post.coverImage = result.secure_url;
  await post.save();
  return post;
};
