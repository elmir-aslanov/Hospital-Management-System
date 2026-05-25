import { Router } from 'express';
import { create }  from './muraciet.controller.js';

const router = Router();

router.post('/', create);

export default router;
