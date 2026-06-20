import { body } from 'express-validator';
import { EQUIPMENT_STATUS } from '../../models/Equipment.model.js';

export const validateCreateEquipment = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('code').trim().notEmpty().withMessage('code is required'),
  body('category').optional().isString().trim(),
  body('wardId').optional().isMongoId().withMessage('wardId must be a valid ObjectId'),
];

export const validateUpdateEquipmentStatus = [
  body('status').notEmpty().isIn(EQUIPMENT_STATUS).withMessage(`status must be one of: ${EQUIPMENT_STATUS.join(', ')}`),
];

export const validateStartSterilization = [
  body('equipmentId').notEmpty().isMongoId().withMessage('Valid equipmentId is required'),
  body('method').notEmpty().isIn(['autoclave', 'chemical', 'dry_heat', 'ethylene_oxide']).withMessage('Invalid sterilization method'),
];

export const validateCompleteSterilization = [
  body('result').notEmpty().isIn(['completed', 'failed']).withMessage("result must be 'completed' or 'failed'"),
  body('notes').optional().isString().trim(),
];
