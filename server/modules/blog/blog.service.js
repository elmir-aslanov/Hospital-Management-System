import BlogPost  from '../../models/BlogPost.model.js';
import ApiError  from '../../utils/ApiError.js';
import { uploadImageBuffer } from '../../config/cloudinary.js';

export const getPublished = ({ limit = 10, category } = {}) => {
  const filter = { isPublished: true };
  if (category) filter.category = category;
  return BlogPost.find(filter)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(Math.min(50, parseInt(limit) || 10))
    .select('-content')   // exclude heavy content from list view
    .lean();
};

export const getBySlug = async (slug) => {
  const post = await BlogPost.findOneAndUpdate(
    { slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true },
  ).lean();
  if (!post) throw new ApiError(404, 'Post not found');
  return post;
};

export const getAll = async ({ page = 1, limit = 20, search, category } = {}) => {
  const pg  = Math.max(1, parseInt(page) || 1);
  const lim = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pg - 1) * lim;

  const filter = {};
  if (category) filter.category = category;
  if (search)   filter.title = { $regex: search, $options: 'i' };

  const [data, total] = await Promise.all([
    BlogPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    BlogPost.countDocuments(filter),
  ]);

  return { data, total, page: pg, pages: Math.ceil(total / lim) || 1 };
};

export const create = (data) => BlogPost.create(data);

export const update = async (id, data) => {
  if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();
  const doc = await BlogPost.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Post not found');
  return doc;
};

export const remove = async (id) => {
  const doc = await BlogPost.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Post not found');
};

export const uploadCover = async (id, file) => {
  if (!file) throw new ApiError(400, 'Image file is required');
  const post = await BlogPost.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  const result = await uploadImageBuffer(file.buffer, {
    folder: 'hms/blog',
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
  });

  post.image = result.secure_url;
  await post.save();
  return post;
};
