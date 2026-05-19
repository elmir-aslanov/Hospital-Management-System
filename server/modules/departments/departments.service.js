import Department from '../../models/Department.model.js';
import ApiError    from '../../utils/ApiError.js';

export const getPublic = (limit = 20) =>
  Department.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .limit(Math.min(50, parseInt(limit) || 20))
    .lean();

export const getAll = () =>
  Department.find({}).sort({ order: 1, createdAt: 1 }).lean();

export const getBySlug = async (slug) => {
  const doc = await Department.findOne({ slug, isActive: true }).lean();
  if (!doc) throw new ApiError(404, 'Department not found');
  return doc;
};

export const create = (data) => Department.create(data);

export const update = async (id, data) => {
  const doc = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Department not found');
  return doc;
};

export const remove = async (id) => {
  const doc = await Department.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!doc) throw new ApiError(404, 'Department not found');
};
