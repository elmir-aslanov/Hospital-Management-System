import { Router } from 'express';
import * as wardsController from './wards.controller.js';
import {
  validateCreateWard,
  validateCreateRoom,
  validateCreateBed,
  validateUpdateBedStatus,
} from './wards.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// IMPORTANT: /stats before /:id
router.get('/stats', authorize('ADMIN'), wardsController.getWardStats);

router.post('/', authorize('ADMIN'), validateCreateWard, validate, wardsController.createWard);
router.get('/', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getWards);

router.get('/:id', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getWardById);

router.post('/:id/rooms', authorize('ADMIN'), validateCreateRoom, validate, wardsController.createRoom);
router.get('/:id/rooms', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getRoomsByWard);

router.post('/:id/beds', authorize('ADMIN'), validateCreateBed, validate, wardsController.createBed);
router.get('/:id/beds', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getBedsByWard);

router.patch(
  '/:wardId/beds/:bedId/status',
  authorize('ADMIN', 'NURSE'),
  validateUpdateBedStatus, validate,
  wardsController.updateBedStatus
);

export default router;
