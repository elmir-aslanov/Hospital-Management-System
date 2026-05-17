import api from './axios';

export const requestEmailOtp = (email) =>
  api.post('/auth/request-email-otp', { email });

export const verifyEmailOtp = (email, otp) =>
  api.post('/auth/verify-email-otp', { email, otp });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (data) =>
  api.post('/auth/register', data);

export const logout = () =>
  api.post('/auth/logout');

export const refreshToken = () =>
  api.post('/auth/refresh-token');

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (data) =>
  api.post('/auth/reset-password', data);
