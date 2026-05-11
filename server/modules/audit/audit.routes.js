import { Router } from 'express';
import { getAuditLogs, getUserAuditLogs } from './audit.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/',              getAuditLogs);
router.get('/user/:userId',  getUserAuditLogs);

export default router;
