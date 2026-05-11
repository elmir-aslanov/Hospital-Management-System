import jwt from 'jsonwebtoken';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateTokens.js';
import logAction from '../../utils/auditLogger.js';

export const registerUser = async ({ fullName, email, password, role }, req) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ fullName, email, password, role });
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  logAction({ userId: user._id, action: 'USER_REGISTER', resourceType: 'User', resourceId: user._id, description: `New user registered: ${email}`, req });

  return { user: { id: user._id, fullName, email, role }, accessToken, refreshToken };
};

export const loginUser = async ({ email, password }, req) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) throw new ApiError(404, 'User not found');

  const valid = await user.comparePassword(password);
  if (!valid) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  logAction({ userId: user._id, action: 'USER_LOGIN', resourceType: 'User', resourceId: user._id, description: `User logged in: ${email}`, req });

  return { user: { id: user._id, fullName: user.fullName, email, role: user.role }, accessToken, refreshToken };
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new ApiError(401, 'Refresh token required');

  let payload;
  try {
    payload = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(payload.userId).select('+refreshToken');
  if (!user) throw new ApiError(404, 'User not found');
  if (user.refreshToken !== incomingRefreshToken) throw new ApiError(401, 'Refresh token mismatch');

  const accessToken = generateAccessToken(user._id, user.role);
  return { accessToken };
};

export const logoutUser = async (userId, req) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  logAction({ userId, action: 'USER_LOGOUT', resourceType: 'User', resourceId: userId, description: 'User logged out', req });
};
