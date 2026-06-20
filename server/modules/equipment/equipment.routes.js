import { Router } from 'express';
import * as equipmentController from './equipment.controller.js';
import {
  validateCreateEquipment,
  validateUpdateEquipmentStatus,
  validateStartSterilization,
  validateCompleteSterilization,
} from './equipment.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();
router.use(authenticate);

const STAFF = ['ADMIN', 'SUPER_ADMIN', 'NURSE', 'LAB_TECHNICIAN'];

router.get('/due-sterilization', authorize(...STAFF), equipmentController.getDueForSterilization);

router.post('/sterilization/start',            authorize(...STAFF), validateStartSterilization, validate,    equipmentController.startSterilization);
router.patch('/sterilization/:cycleId/complete', authorize(...STAFF), validateCompleteSterilization, validate, equipmentController.completeSterilization);

router.post('/',          authorize('ADMIN', 'SUPER_ADMIN'), validateCreateEquipment, validate, equipmentController.createEquipment);
router.get('/',            authorize(...STAFF, 'DOCTOR'),                              equipmentController.getEquipmentList);
router.get('/:id',         authorize(...STAFF, 'DOCTOR'),                              equipmentController.getEquipmentById);
router.patch('/:id/status', authorize(...STAFF),  validateUpdateEquipmentStatus, validate, equipmentController.updateEquipmentStatus);
router.get('/:id/cycles',  authorize(...STAFF, 'DOCTOR'),                              equipmentController.getEquipmentCycles);

export default router;
