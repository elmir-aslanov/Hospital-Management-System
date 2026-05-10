import { Router } from 'express';
import * as usersController from './users.controller.js';
import { validateUpdateUser } from './users.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/me', usersController.getMe);
router.get('/', authorize('SUPER_ADMIN', 'ADMIN'), usersController.getUsers);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN'), usersController.getUserById);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), validateUpdateUser, validate, usersController.updateUser);
router.patch('/:id/deactivate', authorize('SUPER_ADMIN', 'ADMIN'), usersController.deactivateUser);

export default router;
