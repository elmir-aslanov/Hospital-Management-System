import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import { getPagination, paginatedResponse } from '../../utils/pagination.js';

export const getUsers = async (query) => {
  const { skip, limit, page } = getPagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const [data, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return paginatedResponse(data, total, page, limit);
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const updateUser = async (id, updates) => {
  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const deactivateUser = async (id) => {
  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};
