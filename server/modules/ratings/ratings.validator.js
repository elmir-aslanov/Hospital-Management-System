import { body } from 'express-validator';

export const validateCreateRating = [
  body('doctorId').notEmpty().isMongoId().withMessage('Valid doctorId is required'),
  body('appointmentId').notEmpty().isMongoId().withMessage('Valid appointmentId is required'),
  body('rating').notEmpty().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('review').optional().isString().isLength({ max: 500 }).withMessage('Review max 500 chars').trim(),
  body('isAnonymous').optional().isBoolean(),
];
