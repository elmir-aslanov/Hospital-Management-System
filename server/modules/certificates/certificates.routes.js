import { Router } from 'express';
import * as certificatesController from './certificates.controller.js';
import { validateCreateCertificate } from './certificates.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import {
  requirePatientOwnership,
  requirePatientOwnershipForModel,
} from '../../middleware/patientOwnership.middleware.js';
import MedicalCertificate from '../../models/MedicalCertificate.model.js';

const router = Router();
router.use(authenticate);

// /patient/:patientId before /:id
router.get('/patient/:patientId', authorize('ADMIN', 'DOCTOR', 'PATIENT'), requirePatientOwnership('params.patientId'), certificatesController.getPatientCertificates);
router.post('/',                  authorize('DOCTOR'), validateCreateCertificate, validate, certificatesController.createCertificate);
router.get('/:id/download',       authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnershipForModel(MedicalCertificate), certificatesController.downloadCertificate);
router.get('/:id',                authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnershipForModel(MedicalCertificate), certificatesController.getCertificateById);

export default router;
