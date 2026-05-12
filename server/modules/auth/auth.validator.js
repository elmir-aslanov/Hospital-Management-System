import { body } from 'express-validator';
import { ROLES } from '../../config/constants.js';

export const validateRegister = [
  body('fullName').trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').notEmpty().withMessage('Role is required')
    .isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
];

export const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateForgotPassword = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address').normalizeEmail(),
];

export const validateResetPassword = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only digits'),
  body('newPassword').notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
