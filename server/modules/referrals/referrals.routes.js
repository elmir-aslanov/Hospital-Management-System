import { Router } from 'express';
import * as referralsController from './referrals.controller.js';
import { validateCreateReferral, validateUpdateReferralStatus } from './referrals.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { requirePatientOwnership } from '../../middleware/patientOwnership.middleware.js';

const router = Router();
router.use(authenticate);

const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR', 'NURSE'];

router.get('/patient/:patientId',
  authorize(...STAFF_ROLES, 'PATIENT'),
  requirePatientOwnership('params.patientId'),
  referralsController.getPatientReferralHistory
);

router.post('/',           authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR'), validateCreateReferral, validate, referralsController.createReferral);
router.get('/',             authorize(...STAFF_ROLES),                                                       referralsController.getReferrals);
router.get('/:id',          authorize(...STAFF_ROLES),                                                       referralsController.getReferralById);
router.patch('/:id/status', authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR'), validateUpdateReferralStatus, validate, referralsController.updateReferralStatus);

export default router;
