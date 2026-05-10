import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as usersService from './users.service.js';

export const getUsers = asyncHandler(async (req, res) => {
  const result = await usersService.getUsers(req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.user._id);
  res.status(200).json(new ApiResponse(200, user));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await usersService.updateUser(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'User updated'));
});

export const deactivateUser = asyncHandler(async (req, res) => {
  await usersService.deactivateUser(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User deactivated'));
});
