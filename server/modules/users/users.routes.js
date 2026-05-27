import { Router } from 'express';
import * as usersController from './users.controller.js';
import { validateUpdateUser } from './users.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { uploadAvatar } from '../../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

// Self-service routes — no role restriction beyond auth
router.get('/me',     usersController.getMe);
router.put('/me',     usersController.updateMe);
router.post('/avatar', uploadAvatar, usersController.uploadAvatar);

// Admin routes
router.get('/',       authorize('SUPER_ADMIN', 'ADMIN'), usersController.getUsers);
router.post('/',      authorize('SUPER_ADMIN', 'ADMIN'), usersController.createUser);
router.get('/:id',    authorize('SUPER_ADMIN', 'ADMIN'), usersController.getUserById);
router.put('/:id',    authorize('SUPER_ADMIN', 'ADMIN'), validateUpdateUser, validate, usersController.updateUser);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), usersController.deleteUser);
router.patch('/:id/deactivate',     authorize('SUPER_ADMIN', 'ADMIN'), usersController.deactivateUser);
router.patch('/:id/toggle-active',  authorize('SUPER_ADMIN', 'ADMIN'), usersController.toggleUserActive);

export default router;
