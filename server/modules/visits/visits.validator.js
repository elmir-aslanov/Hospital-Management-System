import { body } from 'express-validator';

export const validateCreateVisit = [
  body('patientId').notEmpty().withMessage('patientId is required')
    .isMongoId().withMessage('patientId must be a valid ObjectId'),
  body('doctorId').notEmpty().withMessage('doctorId is required')
    .isMongoId().withMessage('doctorId must be a valid ObjectId'),
  body('appointmentId').optional().isMongoId().withMessage('appointmentId must be a valid ObjectId'),
  body('chiefComplaint').trim().notEmpty().withMessage('chiefComplaint is required')
    .isLength({ min: 3 }).withMessage('chiefComplaint must be at least 3 characters'),
];

export const validateUpdateVisit = [
  body('diagnosis').optional().isString().trim(),
  body('clinicalNotes').optional().isString().trim(),
];
