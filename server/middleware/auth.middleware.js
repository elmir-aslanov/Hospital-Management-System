import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.model.js';

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    throw new ApiError(401, message);
  }

  const user = await User.findById(decoded.id).select('-password -refreshToken');
  if (!user) throw new ApiError(401, 'User not found');
  if (!user.isActive) throw new ApiError(401, 'Account is deactivated');

  req.user = user;
  next();
});

export default authenticate;
