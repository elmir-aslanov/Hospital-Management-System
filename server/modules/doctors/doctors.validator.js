import { body } from 'express-validator';

export const validateCreateDoctor = [
  body('userId')
    .notEmpty().withMessage('userId is required')
    .isMongoId().withMessage('userId must be a valid MongoDB ObjectId'),

  body('specialization')
    .notEmpty().withMessage('Specialization is required')
    .isString().trim(),

  body('departmentId')
    .notEmpty().withMessage('Department is required')
    .isMongoId().withMessage('Department must be a valid MongoDB ObjectId'),

  body('licenseNumber')
    .notEmpty().withMessage('License number is required')
    .isString().trim(),

  body('experience')
    .optional()
    .isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),

  body('consultationFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Consultation fee must be non-negative'),

  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),

  body('bio')
    .optional()
    .isString().isLength({ max: 500 }).withMessage('Bio must be at most 500 characters').trim(),
];

export const validateUpdateDoctor = [
  body('specialization').optional().isString().trim(),
  body('departmentId').optional().notEmpty().withMessage('Department is required')
    .isMongoId().withMessage('Department must be a valid MongoDB ObjectId'),
  body('licenseNumber').optional().isString().trim(),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
  body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Consultation fee must be non-negative'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('bio').optional().isString().isLength({ max: 500 }).withMessage('Bio must be at most 500 characters').trim(),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
];

export const validateUpdateSchedule = [
  body()
    .isArray({ min: 1 }).withMessage('Schedule must be a non-empty array'),

  body('*.dayOfWeek')
    .notEmpty().withMessage('dayOfWeek is required')
    .isInt({ min: 0, max: 6 }).withMessage('dayOfWeek must be an integer between 0 and 6'),

  body('*.startTime')
    .notEmpty().withMessage('startTime is required')
    .matches(/^\d{2}:\d{2}$/).withMessage('startTime must be in HH:MM format'),

  body('*.endTime')
    .notEmpty().withMessage('endTime is required')
    .matches(/^\d{2}:\d{2}$/).withMessage('endTime must be in HH:MM format'),

  body('*.slotDuration')
    .optional()
    .isInt({ min: 15, max: 120 }).withMessage('slotDuration must be between 15 and 120 minutes'),

  body('*.isOff')
    .optional()
    .isBoolean().withMessage('isOff must be a boolean'),
];
