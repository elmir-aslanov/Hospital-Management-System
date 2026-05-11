import { body } from 'express-validator';

export const validateCreateDischargeSummary = [
  body('visitId').notEmpty().withMessage('visitId is required')
    .isMongoId().withMessage('visitId must be a valid ObjectId'),

  body('admissionId').optional().isMongoId().withMessage('admissionId must be a valid ObjectId'),

  body('finalDiagnosis').trim().notEmpty().withMessage('finalDiagnosis is required')
    .isLength({ min: 3 }).withMessage('finalDiagnosis must be at least 3 characters'),

  body('treatmentSummary').trim().notEmpty().withMessage('treatmentSummary is required')
    .isLength({ min: 3 }).withMessage('treatmentSummary must be at least 3 characters'),

  body('dischargeMedications').optional().isArray(),
  body('dischargeMedications.*.name').optional().isString().trim(),
  body('dischargeMedications.*.dosage').optional().isString().trim(),
  body('dischargeMedications.*.instructions').optional().isString().trim(),

  body('followUpDate').optional().isISO8601().withMessage('followUpDate must be a valid date'),
  body('followUpInstructions').optional().isString().trim(),
];
