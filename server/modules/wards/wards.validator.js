import { body, param } from 'express-validator';
import { BED_STATUS } from '../../config/constants.js';

export const validateCreateWard = [
  body('name').trim().notEmpty().withMessage('name is required')
    .isLength({ min: 2 }).withMessage('name must be at least 2 characters'),
  body('type')
    .notEmpty().withMessage('type is required')
    .isIn(['general', 'icu', 'emergency', 'maternity', 'pediatric'])
    .withMessage('type must be one of: general, icu, emergency, maternity, pediatric'),
  body('floor').notEmpty().withMessage('floor is required')
    .isInt({ min: 0 }).withMessage('floor must be a non-negative integer'),
  body('totalBeds').notEmpty().withMessage('totalBeds is required')
    .isInt({ min: 1 }).withMessage('totalBeds must be at least 1'),
  body('headNurseId').optional().isMongoId().withMessage('headNurseId must be a valid ObjectId'),
];

export const validateCreateRoom = [
  body('wardId').notEmpty().withMessage('wardId is required')
    .isMongoId().withMessage('wardId must be a valid ObjectId'),
  body('roomNumber').trim().notEmpty().withMessage('roomNumber is required'),
  body('type').optional().isIn(['single', 'double', 'icu'])
    .withMessage('type must be one of: single, double, icu'),
  body('floor').optional().isInt({ min: 0 }).withMessage('floor must be a non-negative integer'),
];

export const validateCreateBed = [
  body('roomId').notEmpty().withMessage('roomId is required')
    .isMongoId().withMessage('roomId must be a valid ObjectId'),
  body('wardId').notEmpty().withMessage('wardId is required')
    .isMongoId().withMessage('wardId must be a valid ObjectId'),
  body('bedNumber').trim().notEmpty().withMessage('bedNumber is required'),
];

export const validateUpdateBedStatus = [
  param('bedId').isMongoId().withMessage('bedId must be a valid ObjectId'),
  body('status').notEmpty().withMessage('status is required')
    .isIn(Object.values(BED_STATUS))
    .withMessage(`status must be one of: ${Object.values(BED_STATUS).join(', ')}`),
  body('patientId').optional().isMongoId().withMessage('patientId must be a valid ObjectId'),
];
