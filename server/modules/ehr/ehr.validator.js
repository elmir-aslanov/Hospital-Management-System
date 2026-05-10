import { body, param } from 'express-validator';

export const validateCreateRecord = [
  body('patientId').isMongoId().withMessage('Valid patientId is required'),
  body('visitId').isMongoId().withMessage('Valid visitId is required'),
  body('type')
    .isIn(['lab_result', 'imaging', 'clinical_note', 'procedure', 'vaccination', 'other'])
    .withMessage('Invalid record type'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

export const validateEHRParam = [
  param('patientId').isMongoId().withMessage('Invalid patient ID'),
];
