import { body, query, param } from 'express-validator';
import { APPOINTMENT_STATUS } from '../../config/constants.js';

const STATUS_VALUES = Object.values(APPOINTMENT_STATUS);
const TIME_REGEX = /^\d{2}:\d{2}$/;

export const validateCreateAppointment = [
  body('patientId')
    .notEmpty().withMessage('patientId is required')
    .isMongoId().withMessage('patientId must be a valid ObjectId'),

  body('doctorId')
    .notEmpty().withMessage('doctorId is required')
    .isMongoId().withMessage('doctorId must be a valid ObjectId'),

  body('date')
    .notEmpty().withMessage('date is required')
    .isISO8601().withMessage('date must be a valid date (YYYY-MM-DD)')
    .custom((val) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(val) < today) throw new Error('date must be today or a future date');
      return true;
    }),

  body('startTime')
    .notEmpty().withMessage('startTime is required')
    .matches(TIME_REGEX).withMessage('startTime must be in HH:MM format'),

  body('endTime')
    .notEmpty().withMessage('endTime is required')
    .matches(TIME_REGEX).withMessage('endTime must be in HH:MM format')
    .custom((endTime, { req }) => {
      if (endTime <= req.body.startTime) throw new Error('endTime must be after startTime');
      return true;
    }),

  body('reason')
    .trim()
    .notEmpty().withMessage('reason is required')
    .isLength({ min: 3 }).withMessage('reason must be at least 3 characters'),
];

export const validateUpdateStatus = [
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(STATUS_VALUES).withMessage(`status must be one of: ${STATUS_VALUES.join(', ')}`),
];

export const validateGetAppointments = [
  query('status').optional().isIn(STATUS_VALUES).withMessage('Invalid status value'),
  query('doctorId').optional().isMongoId().withMessage('doctorId must be a valid ObjectId'),
  query('patientId').optional().isMongoId().withMessage('patientId must be a valid ObjectId'),
  query('date').optional().isISO8601().withMessage('date must be a valid date string'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];
