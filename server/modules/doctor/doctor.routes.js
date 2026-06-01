import { Router }    from 'express';
import authenticate  from '../../middleware/auth.middleware.js';
import * as ctrl from './doctor.controller.js';

const router = Router();

router.use(authenticate);

// Existing routes
router.get('/appointments/today',            ctrl.getTodayAppointments);
router.get('/patients/:id/analyses',         ctrl.getPatientAnalyses);
router.get('/patients/:id/prescriptions',    ctrl.getPatientPrescriptions);
router.post('/prescriptions',                ctrl.createPrescription);

// New routes
router.get('/me',                            ctrl.getMyProfile);
router.get('/my-patients',                   ctrl.getMyPatients);
router.get('/appointments',                  ctrl.getMyAppointments);
router.get('/stats',                         ctrl.getMyStats);
router.post('/lab-orders',                   ctrl.createLabOrder);
router.get('/lab-orders',                    ctrl.getMyLabOrders);

export default router;
