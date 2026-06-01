import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';
import { forgotPassword, resetPassword } from './passwordReset.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body, req);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .status(201).json(new ApiResponse(201, { user, accessToken }, 'Registration successful'));
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body, req);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .status(200).json(new ApiResponse(200, { user, accessToken }, 'Login successful'));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.id, req);
  res.clearCookie('refreshToken', COOKIE_OPTIONS)
    .status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, 'currentPassword and newPassword required');
  if (newPassword.length < 8) throw new ApiError(400, 'New password must be at least 8 characters');
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const data = await authService.refreshAccessToken(token);
  res.status(200).json(new ApiResponse(200, data, 'Token refreshed'));
});

export const forgotPasswordHandler = asyncHandler(async (req, res) => {
  await forgotPassword(req.body.email);
  res.status(200).json(new ApiResponse(200, null, 'OTP sent to your email'));
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await resetPassword(email, otp, newPassword, req);
  res.status(200).json(new ApiResponse(200, null, 'Password reset successful'));
});
