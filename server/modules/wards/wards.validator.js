import { body, param } from 'express-validator';

export const validateCreateWard = [
  body('name').trim().notEmpty().withMessage('Ward name is required'),
  body('type')
    .isIn(['general', 'icu', 'emergency', 'maternity', 'pediatric', 'surgical'])
    .withMessage('Invalid ward type'),
  body('floor').isInt({ min: 0 }).withMessage('Floor must be a non-negative integer'),
  body('totalBeds').isInt({ min: 1 }).withMessage('Total beds must be at least 1'),
];

export const validateUpdateBedStatus = [
  param('id').isMongoId().withMessage('Invalid ward ID'),
  param('bedId').isMongoId().withMessage('Invalid bed ID'),
  body('status')
    .isIn(['available', 'occupied', 'maintenance', 'reserved'])
    .withMessage('Invalid bed status'),
];
