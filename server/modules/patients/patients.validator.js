import { body, query } from 'express-validator';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const validateCreatePatient = [
  body('userId')
    .notEmpty().withMessage('userId is required')
    .isMongoId().withMessage('userId must be a valid MongoDB ObjectId'),

  body('bloodGroup')
    .optional()
    .isIn(BLOOD_GROUPS).withMessage(`bloodGroup must be one of: ${BLOOD_GROUPS.join(', ')}`),

  body('allergies')
    .optional()
    .isArray().withMessage('allergies must be an array'),

  body('allergies.*')
    .optional()
    .isString().withMessage('Each allergy must be a string'),

  body('chronicConditions')
    .optional()
    .isArray().withMessage('chronicConditions must be an array'),

  body('chronicConditions.*')
    .optional()
    .isString().withMessage('Each condition must be a string'),

  body('emergencyContact.name').optional().isString().trim(),
  body('emergencyContact.phone').optional().isString().trim(),
  body('emergencyContact.relation').optional().isString().trim(),
];

export const validateUpdatePatient = [
  body('bloodGroup')
    .optional()
    .isIn(BLOOD_GROUPS).withMessage(`bloodGroup must be one of: ${BLOOD_GROUPS.join(', ')}`),

  body('allergies')
    .optional()
    .isArray().withMessage('allergies must be an array'),

  body('chronicConditions')
    .optional()
    .isArray().withMessage('chronicConditions must be an array'),

  body('emergencyContact.name').optional().isString().trim(),
  body('emergencyContact.phone').optional().isString().trim(),
  body('emergencyContact.relation').optional().isString().trim(),
];

export const validateSearchPatient = [
  query('q').optional().isString().trim(),
  query('query').optional().isString().trim(),
  query('condition').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be an integer >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];
