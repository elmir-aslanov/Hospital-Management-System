import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || process.env.JWT_EXPIRES_IN || '1h',
  });

export const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
