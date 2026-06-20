import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import User from '../../models/User.model.js';
import uploadBufferToCloudinary from '../../utils/uploadToCloudinary.js';
import * as usersService from './users.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getMe(req.user.id);
  res.status(200).json(new ApiResponse(200, user));
});

export const updateMe = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  const user = await usersService.updateMe(req.user.id, { fullName, phone });
  res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
});

export const getUsers = asyncHandler(async (req, res) => {
  const result = await usersService.getUsers(req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await usersService.updateUser(req.params.id, req.body, req.user.role);
  res.status(200).json(new ApiResponse(200, user, 'User updated'));
});

export const deactivateUser = asyncHandler(async (req, res) => {
  await usersService.deactivateUser(req.params.id, req.user.role);
  res.status(200).json(new ApiResponse(200, null, 'User deactivated'));
});

export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await usersService.toggleUserActive(req.params.id, req.user.id, req.user.role);
  res.status(200).json(new ApiResponse(200, user, 'User status updated'));
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.body, req.user.role);
  res.status(201).json(new ApiResponse(201, user, 'User created'));
});

export const deleteUser = asyncHandler(async (req, res) => {
  await usersService.deleteUser(req.params.id, req.user.role);
  res.status(200).json(new ApiResponse(200, null, 'User deleted'));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const avatarUrl = await uploadBufferToCloudinary(req.file.buffer, {
    folder:    'hms/avatars',
    public_id: `avatar-${req.user.id}`,
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
  });

  await User.findByIdAndUpdate(req.user.id, { photoUrl: avatarUrl, avatar: avatarUrl });
  res.status(200).json(new ApiResponse(200, { photoUrl: avatarUrl, avatarUrl }, 'Avatar updated'));
});
