import BlogPost  from '../../models/BlogPost.model.js';
import ApiError  from '../../utils/ApiError.js';

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

export const getAll = () =>
  BlogPost.find({}).sort({ createdAt: -1 }).lean();

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
