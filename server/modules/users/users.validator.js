import { body, param } from 'express-validator';

export const validateUpdateUser = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().isMobilePhone().withMessage('Invalid phone number'),
];
