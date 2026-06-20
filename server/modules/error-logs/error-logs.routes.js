import { Router } from 'express';
import { getErrorLogs } from './error-logs.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// Read-only — error logs are never editable from the UI.
router.get('/', getErrorLogs);

export default router;
