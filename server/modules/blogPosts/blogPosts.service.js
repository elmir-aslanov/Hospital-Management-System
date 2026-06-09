import Blog from '../../models/Blog.model.js';
import ApiError from '../../utils/ApiError.js';
import { uploadImageBuffer } from '../../config/cloudinary.js';

export const getAll = async ({ page = 1, limit = 9, category, search } = {}) => {
  const pg  = Math.max(1, parseInt(page) || 1);
  const lim = Math.min(50, Math.max(1, parseInt(limit) || 9));
  const skip = (pg - 1) * lim;

  const filter = {};
  if (category) filter.category = category;
  if (search)   filter.title = { $regex: search, $options: 'i' };

  const [data, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'fullName name surname photoUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  return { data, total, page: pg, pages: Math.ceil(total / lim) || 1 };
};

export const getAdminAll = async ({ page = 1, limit = 20, category, search } = {}) => {
  const pg  = Math.max(1, parseInt(page) || 1);
  const lim = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pg - 1) * lim;

  const filter = {};
  if (category) filter.category = category;
  if (search)   filter.title = { $regex: search, $options: 'i' };

  const [data, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'fullName name surname photoUrl')
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
    { slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true },
  )
    .populate('author', 'fullName name surname photoUrl')
    .lean();
  if (!post) throw new ApiError(404, 'Post not found');
  return post;
};

export const create = async (data, authorId) => {
  const payload = {
    ...data,
    author: authorId,
    excerpt: data.excerpt?.trim() || (data.content || '').slice(0, 200),
  };
  return Blog.create(payload);
};

export const update = async (id, data) => {
  if (data.excerpt === '') delete data.excerpt;
  const doc = await Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Post not found');
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
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
  });

  post.coverImage = result.secure_url;
  await post.save();
  return post;
};
