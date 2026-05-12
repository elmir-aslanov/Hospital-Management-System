import { Router } from 'express';
import * as ratingsController from './ratings.controller.js';
import { validateCreateRating } from './ratings.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/my',                authorize('PATIENT'),                                       ratingsController.getMyRatings);
router.get('/doctor/:doctorId',  authorize('ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'),   ratingsController.getDoctorRatings);
router.post('/',                 authorize('PATIENT'), validateCreateRating, validate,        ratingsController.createRating);

export default router;
