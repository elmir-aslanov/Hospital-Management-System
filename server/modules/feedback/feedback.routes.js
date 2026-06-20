import { Router } from 'express';
import * as ctrl from './feedback.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

// Public — anonymous submission allowed (mirrors the existing contact-form
// policy); a logged-in patient is auto-linked via an optional Bearer token.
router.post('/', ctrl.createFeedback);

router.use(authenticate);

router.get('/mine', authorize('PATIENT'), ctrl.getMyFeedback);
router.get('/',     authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM'), ctrl.getFeedbackList);
router.get('/:id',  authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'PATIENT'), ctrl.getFeedbackById);
router.patch('/:id', authorize('ADMIN', 'SUPER_ADMIN'), ctrl.updateFeedbackStatus);

export default router;
