import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import bcrypt from 'bcryptjs';

const SAFE_SELECT = '-password -refreshToken';

// ADMIN must never be able to create, promote to, edit, deactivate, or
// delete a SUPER_ADMIN account — only SUPER_ADMIN can act on SUPER_ADMIN.
const assertNotEscalating = (requesterRole, targetRole) => {
  if (targetRole === 'SUPER_ADMIN' && requesterRole !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Only SUPER_ADMIN can perform this action on a SUPER_ADMIN account');
  }
};

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).select(SAFE_SELECT);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const updateMe = async (userId, { fullName, phone }) => {
  const updates = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (phone    !== undefined) updates.phone    = phone;

  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select(SAFE_SELECT);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const getUsers = async ({ role, isActive, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};
  if (role)                  filter.role     = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;

  const [data, total] = await Promise.all([
    User.find(filter).select(SAFE_SELECT).sort({ createdAt: -1 }).skip(skip).limit(lim),
    User.countDocuments(filter),
  ]);
  return { users: data, total, page: pg, limit: lim };
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select(SAFE_SELECT);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const updateUser = async (id, data, requesterRole) => {
  const existing = await User.findById(id);
  if (!existing) throw new ApiError(404, 'User not found');
  assertNotEscalating(requesterRole, existing.role);
  if (data.role !== undefined) assertNotEscalating(requesterRole, data.role);

  if (data.name !== undefined || data.surname !== undefined) {
    const n = data.name    ?? existing.name    ?? '';
    const s = data.surname ?? existing.surname ?? '';
    data.fullName = `${n} ${s}`.trim();
  } else if (data.fullName !== undefined && !data.name && !data.surname) {
    const parts = data.fullName.trim().split(/\s+/);
    data.name    = parts[0] || '';
    data.surname = parts.slice(1).join(' ') || '';
  }

  Object.assign(existing, data);
  await existing.save();
  return existing;
};

export const toggleUserActive = async (targetUserId, requestingUserId, requesterRole) => {
  if (String(targetUserId) === String(requestingUserId)) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }
  const user = await User.findById(targetUserId).select(SAFE_SELECT);
  if (!user) throw new ApiError(404, 'User not found');
  assertNotEscalating(requesterRole, user.role);
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  return user;
};

export const deactivateUser = async (id, requesterRole) => {
  const existing = await User.findById(id).select('role');
  if (!existing) throw new ApiError(404, 'User not found');
  assertNotEscalating(requesterRole, existing.role);
  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select(SAFE_SELECT);
  return user;
};

export const createUser = async (data, requesterRole) => {
  const { name, surname, email, password, role, ...rest } = data;
  if (!email || !password || !role) throw new ApiError(400, 'Email, şifrə və rol məcburidir');
  assertNotEscalating(requesterRole, role);
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'Bu email artıq istifadə olunur');
  // fullName is synced in pre-save hook; set it now so legacy readers work immediately
  const fullName = data.fullName?.trim() ||
    (name && surname ? `${name} ${surname}`.trim() : (name || surname || ''));
  const user = new User({ name, surname, fullName, email, password, role, ...rest });
  await user.save();
  return User.findById(user._id).select(SAFE_SELECT);
};

export const deleteUser = async (id, requesterRole) => {
  const existing = await User.findById(id).select('role');
  if (!existing) throw new ApiError(404, 'User not found');
  assertNotEscalating(requesterRole, existing.role);
  const user = await User.findByIdAndDelete(id);
  return user;
};
