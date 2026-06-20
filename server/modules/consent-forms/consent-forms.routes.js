import { Router } from 'express';
import * as ctrl from './consent-forms.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { requirePatientOwnershipForModel } from '../../middleware/patientOwnership.middleware.js';
import ConsentForm from '../../models/ConsentForm.model.js';

const router = Router();

router.use(authenticate);

router.get('/mine',        authorize('PATIENT'), ctrl.getMyConsentForms);
router.get('/doctor/mine', authorize('DOCTOR'), ctrl.getDoctorConsentForms);

router.post('/',           authorize('DOCTOR', 'ADMIN', 'SUPER_ADMIN'), ctrl.createConsentForm);
router.put('/:id',         authorize('DOCTOR', 'ADMIN', 'SUPER_ADMIN'), ctrl.updateConsentForm);
router.patch('/:id/send',  authorize('DOCTOR', 'ADMIN', 'SUPER_ADMIN'), ctrl.sendConsentForm);
router.patch('/:id/respond', authorize('PATIENT'), requirePatientOwnershipForModel(ConsentForm), ctrl.respondToConsentForm);
router.patch('/:id/archive', authorize('DOCTOR', 'ADMIN', 'SUPER_ADMIN'), ctrl.archiveConsentForm);

router.get('/:id', authorize('DOCTOR', 'ADMIN', 'SUPER_ADMIN', 'PATIENT'), requirePatientOwnershipForModel(ConsentForm), ctrl.getConsentFormById);

export default router;
