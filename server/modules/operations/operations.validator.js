import { body } from 'express-validator';

export const validateCreateOperation = [
  body('patientId').notEmpty().isMongoId().withMessage('Valid patientId is required'),
  body('surgeonId').notEmpty().isMongoId().withMessage('Valid surgeonId is required'),
  body('assistingDoctorIds').optional().isArray().withMessage('assistingDoctorIds must be an array'),
  body('assistingDoctorIds.*').optional().isMongoId().withMessage('Each assistingDoctorId must be a valid ObjectId'),
  body('anesthesiologistId').optional().isMongoId().withMessage('anesthesiologistId must be a valid ObjectId'),
  body('procedureName').trim().notEmpty().withMessage('procedureName is required'),
  body('room').optional().isString().trim(),
  body('priority').optional().isIn(['elective', 'urgent', 'emergency']).withMessage('Invalid priority'),
  body('date').notEmpty().isISO8601().withMessage('date must be a valid date'),
  body('startTime').notEmpty().matches(/^\d{2}:\d{2}$/).withMessage('startTime must be HH:MM'),
  body('estimatedDurationMinutes').notEmpty().isInt({ min: 5 }).withMessage('estimatedDurationMinutes must be >= 5'),
];

export const validateUpdateOperationStatus = [
  body('status').notEmpty().isIn(['scheduled', 'in_progress', 'completed', 'postponed', 'cancelled']).withMessage('Invalid status'),
  body('reason').optional().isString().trim(),
  body('postOpNotes').optional().isString().trim(),
];

export const validateRescheduleOperation = [
  body('date').notEmpty().isISO8601().withMessage('date must be a valid date'),
  body('startTime').notEmpty().matches(/^\d{2}:\d{2}$/).withMessage('startTime must be HH:MM'),
  body('estimatedDurationMinutes').optional().isInt({ min: 5 }).withMessage('estimatedDurationMinutes must be >= 5'),
];
