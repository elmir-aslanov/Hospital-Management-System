import { body, param } from 'express-validator';
import { APPOINTMENT_STATUS } from '../../config/constants.js';

export const validateCreateAppointment = [
  body('patientId').isMongoId().withMessage('Valid patientId is required'),
  body('doctorId').isMongoId().withMessage('Valid doctorId is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('startTime must be HH:mm'),
  body('endTime').matches(/^\d{2}:\d{2}$/).withMessage('endTime must be HH:mm'),
  body('reason').optional().trim(),
];

export const validateStatusUpdate = [
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('status')
    .isIn(Object.values(APPOINTMENT_STATUS))
    .withMessage('Invalid status value'),
];
