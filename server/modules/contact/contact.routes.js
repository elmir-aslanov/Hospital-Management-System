import { Router }  from 'express';
import * as ctrl    from './contact.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

// ── Public — anyone can submit a contact message ────────────────────────────────
router.post('/', authLimiter, ctrl.submit);

// ── Admin ──────────────────────────────────────────────────────────────────────
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/',              ctrl.getAll);
router.patch('/:id/read',    ctrl.markRead);
router.patch('/:id/replied', ctrl.markReplied);
router.delete('/:id',        ctrl.remove);

export default router;
