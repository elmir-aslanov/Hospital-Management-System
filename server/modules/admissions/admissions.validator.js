import { body } from 'express-validator';

export const validateAdmitPatient = [
  body('patientId').notEmpty().withMessage('patientId is required')
    .isMongoId().withMessage('patientId must be a valid ObjectId'),
  body('bedId').notEmpty().withMessage('bedId is required')
    .isMongoId().withMessage('bedId must be a valid ObjectId'),
  body('wardId').notEmpty().withMessage('wardId is required')
    .isMongoId().withMessage('wardId must be a valid ObjectId'),
  body('reason').trim().notEmpty().withMessage('reason is required')
    .isLength({ min: 3 }).withMessage('reason must be at least 3 characters'),
];

export const validateDischargePatient = [
  body('dischargeDate').optional()
    .isISO8601().withMessage('dischargeDate must be a valid date'),
];
