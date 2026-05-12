import { body } from 'express-validator';

export const validateAddMedicine = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('genericName').optional().isString().trim(),
  body('category').notEmpty()
    .isIn(['antibiotic', 'analgesic', 'antihistamine', 'cardiovascular', 'diabetes', 'vitamin', 'other'])
    .withMessage('Invalid category'),
  body('unit').notEmpty()
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops'])
    .withMessage('Invalid unit'),
  body('stock').optional().isInt({ min: 0 }).withMessage('stock must be >= 0'),
  body('minStockLevel').optional().isInt({ min: 0 }),
  body('unitPrice').notEmpty().isFloat({ min: 0 }).withMessage('unitPrice must be >= 0'),
  body('manufacturer').optional().isString().trim(),
  body('expiryDate').optional().isISO8601().withMessage('expiryDate must be a valid date'),
];

export const validateStockUpdate = [
  body('quantity').notEmpty().isInt({ min: 1 }).withMessage('quantity must be >= 1'),
  body('reason').trim().notEmpty().isLength({ min: 3 }).withMessage('reason min 3 chars'),
];

export const validateDispenseMedicine = [
  body('prescriptionId').notEmpty().isMongoId().withMessage('Valid prescriptionId is required'),
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.medicineId').notEmpty().isMongoId().withMessage('Valid medicineId is required'),
  body('items.*.quantity').notEmpty().isInt({ min: 1 }).withMessage('quantity must be >= 1'),
];
