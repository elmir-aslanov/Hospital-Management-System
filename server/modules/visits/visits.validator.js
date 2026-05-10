import { body, param } from 'express-validator';

export const validateCreateVisit = [
  body('patientId').isMongoId().withMessage('Valid patientId is required'),
  body('chiefComplaint').trim().notEmpty().withMessage('Chief complaint is required'),
  body('appointmentId').optional().isMongoId(),
];

export const validateCloseVisit = [
  param('id').isMongoId().withMessage('Invalid visit ID'),
  body('diagnosis').optional().trim(),
  body('clinicalNotes').optional().trim(),
];
