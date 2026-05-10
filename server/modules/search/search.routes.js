import { Router } from 'express';
import { searchPatientsHandler } from './search.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// F8: Search and filter patients by name, ID, or condition
router.get('/patients', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), searchPatientsHandler);

export default router;
