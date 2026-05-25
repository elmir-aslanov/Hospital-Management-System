import { Router }    from 'express';
import authenticate  from '../../middleware/auth.middleware.js';
import {
  getTodayAppointments,
  getPatientAnalyses,
  getPatientPrescriptions,
  createPrescription,
} from './doctor.controller.js';

const router = Router();

router.use(authenticate);

router.get('/appointments/today',            getTodayAppointments);
router.get('/patients/:id/analyses',         getPatientAnalyses);
router.get('/patients/:id/prescriptions',    getPatientPrescriptions);
router.post('/prescriptions',                createPrescription);

export default router;
