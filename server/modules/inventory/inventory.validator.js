import { body } from 'express-validator';

export const validateAddMedicine = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('genericName').optional().isString().trim(),
  body('category').optional().isString().trim(),
  body('unit').notEmpty().isString().trim().withMessage('unit is required'),
  body('stock').optional().isNumeric().withMessage('stock must be a number'),
  body('quantity').optional().isNumeric(),        // frontend alias for stock
  body('minStockLevel').optional().isNumeric(),
  body('minStock').optional().isNumeric(),         // frontend alias for minStockLevel
  body('unitPrice').notEmpty().isFloat({ min: 0 }).withMessage('unitPrice must be >= 0'),
  body('manufacturer').optional().isString().trim(),
  body('expiryDate').optional().isISO8601().withMessage('expiryDate must be a valid date'),
  body('description').optional().isString().trim(),
];

export const validateStockUpdate = [
  body('quantity').notEmpty().isInt({ min: 1 }).withMessage('quantity must be >= 1'),
  body('reason').optional().isString().trim(),     // optional — frontend may send note instead
  body('note').optional().isString().trim(),
];

export const validateDispenseMedicine = [
  body('prescriptionId').notEmpty().isMongoId().withMessage('Valid prescriptionId is required'),
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.medicineId').notEmpty().isMongoId().withMessage('Valid medicineId is required'),
  body('items.*.quantity').notEmpty().isInt({ min: 1 }).withMessage('quantity must be >= 1'),
];
