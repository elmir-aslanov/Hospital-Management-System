import { Router } from 'express';
import * as admissionsController from './admissions.controller.js';
import { validateAdmitPatient, validateDischargePatient, validateTransferPatient } from './admissions.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// IMPORTANT: /active and /patient/:patientId before /:id
router.get('/active',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  admissionsController.getActiveAdmissions
);

router.get('/patient/:patientId',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  admissionsController.getPatientAdmissionHistory
);

router.post('/',
  authorize('ADMIN', 'DOCTOR'),
  validateAdmitPatient, validate,
  admissionsController.admitPatient
);

router.get('/',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  admissionsController.getAdmissions
);

router.get('/:id',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  admissionsController.getAdmissionById
);

router.patch('/:id/discharge',
  authorize('ADMIN', 'DOCTOR'),
  validateDischargePatient, validate,
  admissionsController.dischargePatient
);

router.patch('/:id/transfer',
  authorize('ADMIN', 'DOCTOR', 'NURSE'),
  validateTransferPatient, validate,
  admissionsController.transferPatient
);

export default router;
