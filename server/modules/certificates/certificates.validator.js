import { body } from 'express-validator';

export const validateCreateCertificate = [
  body('patientId').notEmpty().isMongoId().withMessage('Valid patientId is required'),
  body('visitId').notEmpty().isMongoId().withMessage('Valid visitId is required'),
  body('type')
    .notEmpty()
    .isIn(['sick_leave', 'fitness', 'specialist_referral', 'medical_report'])
    .withMessage('Invalid certificate type'),
  body('purpose').trim().notEmpty().isLength({ min: 5 }).withMessage('Purpose min 5 chars'),
  body('diagnosis').optional().isString().trim(),
  body('recommendations').optional().isString().trim(),
  body('validFrom').notEmpty().isISO8601().withMessage('validFrom must be a valid date'),
  body('validUntil')
    .optional()
    .isISO8601().withMessage('validUntil must be a valid date')
    .custom((val, { req }) => {
      if (val && new Date(val) <= new Date(req.body.validFrom)) {
        throw new Error('validUntil must be after validFrom');
      }
      return true;
    }),
];
