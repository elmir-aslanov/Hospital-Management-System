import { body } from 'express-validator';

export const validateRecordVitals = [
  body('patientId').notEmpty().withMessage('patientId is required').isMongoId(),
  body('visitId').notEmpty().withMessage('visitId is required').isMongoId(),

  body('bloodPressure.systolic').optional()
    .isInt({ min: 60, max: 250 }).withMessage('systolic must be between 60 and 250'),
  body('bloodPressure.diastolic').optional()
    .isInt({ min: 40, max: 150 }).withMessage('diastolic must be between 40 and 150'),

  body('heartRate').optional()
    .isInt({ min: 30, max: 250 }).withMessage('heartRate must be between 30 and 250'),
  body('temperature').optional()
    .isFloat({ min: 34, max: 42 }).withMessage('temperature must be between 34 and 42'),
  body('weight').optional()
    .isFloat({ min: 1, max: 500 }).withMessage('weight must be between 1 and 500'),
  body('height').optional()
    .isFloat({ min: 30, max: 250 }).withMessage('height must be between 30 and 250'),
  body('oxygenSaturation').optional()
    .isInt({ min: 50, max: 100 }).withMessage('oxygenSaturation must be between 50 and 100'),
  body('respiratoryRate').optional()
    .isInt({ min: 5, max: 60 }).withMessage('respiratoryRate must be between 5 and 60'),

  body('notes').optional().isString().trim(),
];
