import { Router } from 'express';
import * as wardsController from './wards.controller.js';
import { validateCreateWard, validateUpdateBedStatus } from './wards.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), validateCreateWard, validate, wardsController.createWard);
router.get('/', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getWards);
router.get('/:id/beds', authorize('ADMIN', 'DOCTOR', 'NURSE'), wardsController.getBedsByWard);
router.patch('/:id/beds/:bedId', authorize('ADMIN', 'NURSE'), validateUpdateBedStatus, validate, wardsController.updateBedStatus);

export default router;
