import { Router } from 'express';
import { searchPatients } from './search.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/patients',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  searchPatients
);

export default router;
