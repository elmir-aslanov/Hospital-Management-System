import { Router } from 'express';
import { searchPublicResult } from '../lab/lab.controller.js';

const router = Router();

router.post('/search', searchPublicResult);

export default router;
