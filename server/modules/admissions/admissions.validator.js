import { body, param } from 'express-validator';

export const validateAdmitPatient = [
  body('patientId').isMongoId().withMessage('Valid patientId is required'),
  body('bedId').isMongoId().withMessage('Valid bedId is required'),
  body('wardId').isMongoId().withMessage('Valid wardId is required'),
  body('reason').trim().notEmpty().withMessage('Admission reason is required'),
];

export const validateDischarge = [
  param('id').isMongoId().withMessage('Invalid admission ID'),
];
