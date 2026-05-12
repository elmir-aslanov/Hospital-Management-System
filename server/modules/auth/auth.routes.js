import { Router } from 'express';
import * as authController from './auth.controller.js';
import {
  validateRegister, validateLogin,
  validateForgotPassword, validateResetPassword,
} from './auth.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/register',        authLimiter, validateRegister,        validate, authController.register);
router.post('/login',           authLimiter, validateLogin,           validate, authController.login);
router.post('/logout',          authenticate, authController.logout);
router.post('/refresh-token',   authController.refreshToken);
router.post('/forgot-password', authLimiter, validateForgotPassword,  validate, authController.forgotPasswordHandler);
router.post('/reset-password',  authLimiter, validateResetPassword,   validate, authController.resetPasswordHandler);

export default router;
