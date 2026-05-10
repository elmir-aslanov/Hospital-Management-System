import { body, param } from 'express-validator';

export const validateCreatePatient = [
  body('userId').isMongoId().withMessage('Valid userId is required'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('emergencyContact.name').optional().trim().notEmpty(),
  body('emergencyContact.phone').optional().trim().notEmpty(),
];

export const validateUpdatePatient = [
  param('id').isMongoId().withMessage('Invalid patient ID'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
];
