import { body, param } from 'express-validator';

export const validateCreateDischargeSummary = [
  body('visitId').isMongoId().withMessage('Valid visitId is required'),
  body('patientId').isMongoId().withMessage('Valid patientId is required'),
  body('admissionDate').isISO8601().withMessage('Valid admissionDate is required'),
  body('dischargeDate').isISO8601().withMessage('Valid dischargeDate is required'),
  body('finalDiagnosis').trim().notEmpty().withMessage('Final diagnosis is required'),
  body('treatmentSummary').trim().notEmpty().withMessage('Treatment summary is required'),
];

export const validateDischargeParam = [
  param('id').isMongoId().withMessage('Invalid discharge summary ID'),
];
