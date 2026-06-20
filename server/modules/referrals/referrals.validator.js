import { body } from 'express-validator';

export const validateCreateReferral = [
  body('patientId').notEmpty().isMongoId().withMessage('Valid patientId is required'),
  body('referringDoctorId').notEmpty().isMongoId().withMessage('Valid referringDoctorId is required'),
  body('referredToDoctorId').optional().isMongoId().withMessage('referredToDoctorId must be a valid ObjectId'),
  body('referredToDepartmentId').optional().isMongoId().withMessage('referredToDepartmentId must be a valid ObjectId'),
  body('reason').trim().notEmpty().withMessage('reason is required'),
  body('clinicalNotes').optional().isString().trim(),
  body('urgency').optional().isIn(['routine', 'urgent', 'emergency']).withMessage('Invalid urgency'),
];

export const validateUpdateReferralStatus = [
  body('status').notEmpty().isIn(['accepted', 'declined', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('declineReason').optional().isString().trim(),
  body('consultationNotes').optional().isString().trim(),
];
