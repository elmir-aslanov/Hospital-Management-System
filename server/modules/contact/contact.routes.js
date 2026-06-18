import { Router }  from 'express';
import * as ctrl    from './contact.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/',                    authLimiter, ctrl.submit);
router.get('/verify-email',                      ctrl.verifyEmail);      // browser redirect
router.post('/resend-verification', authLimiter, ctrl.resendVerification);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/',               ctrl.getAll);
router.patch('/:id/read',     ctrl.markRead);
router.patch('/:id/replied',  ctrl.markReplied);
router.post('/:id/reply',     ctrl.sendReply);
router.delete('/:id',         ctrl.remove);

export default router;
