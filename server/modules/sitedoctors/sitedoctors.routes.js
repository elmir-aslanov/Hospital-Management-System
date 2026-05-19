import { Router }  from 'express';
import * as ctrl    from './sitedoctors.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

// ── PUBLIC — no auth required ─────────────────────────────────────────────────
router.get('/', ctrl.getPublicDoctors);

// ── ADMIN — auth + role check ─────────────────────────────────────────────────
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/all',    ctrl.getAllDoctors);
router.post('/',      ctrl.createDoctor);
router.put('/:id',    ctrl.updateDoctor);
router.delete('/:id', ctrl.deleteDoctor);

export default router;
