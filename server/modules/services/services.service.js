import Service   from '../../models/Service.model.js';
import ApiError  from '../../utils/ApiError.js';

export const getPublic = ({ limit = 20, department } = {}) => {
  const filter = { isActive: true };
  if (department) filter.department = department;
  return Service.find(filter)
    .sort({ order: 1, createdAt: 1 })
    .limit(Math.min(100, parseInt(limit) || 20))
    .lean();
};

export const getAll = () =>
  Service.find({}).sort({ order: 1, createdAt: 1 }).lean();

export const getBySlug = async (slug) => {
  const doc = await Service.findOne({ slug, isActive: true }).lean();
  if (!doc) throw new ApiError(404, 'Service not found');
  return doc;
};

export const create = (data) => Service.create(data);

export const update = async (id, data) => {
  const doc = await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Service not found');
  return doc;
};

export const remove = async (id) => {
  const doc = await Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!doc) throw new ApiError(404, 'Service not found');
};
