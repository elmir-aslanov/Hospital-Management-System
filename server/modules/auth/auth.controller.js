import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(new ApiResponse(201, result, 'User registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: incoming } = req.body;
  const tokens = await authService.refreshAccessToken(incoming);
  res.status(200).json(new ApiResponse(200, tokens, 'Token refreshed'));
});
