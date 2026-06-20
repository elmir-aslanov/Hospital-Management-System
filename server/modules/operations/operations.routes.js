import { Router } from 'express';
import * as operationsController from './operations.controller.js';
import {
  validateCreateOperation,
  validateUpdateOperationStatus,
  validateRescheduleOperation,
} from './operations.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();
router.use(authenticate);

const VIEW_ROLES   = ['ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR', 'NURSE', 'RECEPTIONIST'];
const MANAGE_ROLES = ['ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR'];

router.post('/',              authorize(...MANAGE_ROLES), validateCreateOperation, validate, operationsController.createOperation);
router.get('/',                authorize(...VIEW_ROLES),                                      operationsController.getOperations);
router.get('/:id',             authorize(...VIEW_ROLES),                                      operationsController.getOperationById);
router.patch('/:id/status',    authorize(...MANAGE_ROLES, 'NURSE'), validateUpdateOperationStatus, validate, operationsController.updateOperationStatus);
router.patch('/:id/reschedule', authorize(...MANAGE_ROLES), validateRescheduleOperation, validate, operationsController.rescheduleOperation);

export default router;
