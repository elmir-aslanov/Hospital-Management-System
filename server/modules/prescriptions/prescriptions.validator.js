import { body, param } from 'express-validator';

export const validateCreatePrescription = [
  body('visitId').isMongoId().withMessage('Valid visitId is required'),
  body('patientId').isMongoId().withMessage('Valid patientId is required'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').trim().notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').trim().notEmpty().withMessage('Dosage is required'),
  body('medications.*.frequency').trim().notEmpty().withMessage('Frequency is required'),
  body('medications.*.duration').trim().notEmpty().withMessage('Duration is required'),
];

export const validatePrescriptionParam = [
  param('id').isMongoId().withMessage('Invalid prescription ID'),
];
