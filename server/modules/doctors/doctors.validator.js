import { body, param } from 'express-validator';

export const validateCreateDoctor = [
  body('userId').isMongoId().withMessage('Valid userId is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
];

export const validateUpdateSchedule = [
  param('id').isMongoId().withMessage('Invalid doctor ID'),
  body('schedule').isArray({ min: 1 }).withMessage('Schedule must be a non-empty array'),
  body('schedule.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('dayOfWeek must be 0-6'),
  body('schedule.*.startTime').matches(/^\d{2}:\d{2}$/).withMessage('startTime must be HH:mm'),
  body('schedule.*.endTime').matches(/^\d{2}:\d{2}$/).withMessage('endTime must be HH:mm'),
];
