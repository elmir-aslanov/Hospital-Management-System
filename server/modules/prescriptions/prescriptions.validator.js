import { body } from 'express-validator';

export const validateCreatePrescription = [
  body('visitId').notEmpty().withMessage('visitId is required')
    .isMongoId().withMessage('visitId must be a valid ObjectId'),

  body('patientId').notEmpty().withMessage('patientId is required')
    .isMongoId().withMessage('patientId must be a valid ObjectId'),

  body('medications').isArray({ min: 1 }).withMessage('medications must be a non-empty array'),

  body('medications.*.name').trim().notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').trim().notEmpty().withMessage('Medication dosage is required'),
  body('medications.*.frequency').trim().notEmpty().withMessage('Medication frequency is required'),
  body('medications.*.duration').trim().notEmpty().withMessage('Medication duration is required'),
  body('medications.*.instructions').optional().isString().trim(),
  body('medications.*.quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),

  body('notes').optional().isString().trim(),
];
