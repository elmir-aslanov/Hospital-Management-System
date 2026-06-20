import { body, param } from 'express-validator';

export const validateCreateShift = [
  body('userId').notEmpty().isMongoId().withMessage('Valid userId is required'),
  body('wardId').optional().isMongoId().withMessage('wardId must be a valid ObjectId'),
  body('departmentId').optional().isMongoId().withMessage('departmentId must be a valid ObjectId'),
  body('shiftType').notEmpty().isIn(['morning', 'afternoon', 'night']).withMessage('shiftType must be morning, afternoon, or night'),
  body('date')
    .notEmpty().isISO8601().withMessage('date must be a valid date'),
  body('startTime').notEmpty().matches(/^\d{2}:\d{2}$/).withMessage('startTime must be HH:MM'),
  body('endTime').notEmpty().matches(/^\d{2}:\d{2}$/).withMessage('endTime must be HH:MM'),
  body('breakStartTime').optional({ checkFalsy: true }).matches(/^\d{2}:\d{2}$/).withMessage('breakStartTime must be HH:MM'),
  body('breakEndTime').optional({ checkFalsy: true }).matches(/^\d{2}:\d{2}$/).withMessage('breakEndTime must be HH:MM'),
  body('notes').optional().isString().trim(),
];

const SHIFT_STATUSES = ['scheduled', 'active', 'completed', 'off', 'vacation', 'sick_leave', 'cancelled'];

export const validateUpdateShiftStatus = [
  param('id').isMongoId().withMessage('Invalid shift ID'),
  body('status')
    .notEmpty()
    .isIn(SHIFT_STATUSES)
    .withMessage(`status must be one of: ${SHIFT_STATUSES.join(', ')}`),
];
