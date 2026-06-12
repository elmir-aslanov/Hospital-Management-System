import { Router } from 'express';
import { searchPublicResult, lookupPublicResult } from '../lab/lab.controller.js';
import { labLookupLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/search', searchPublicResult);
router.post('/lookup', labLookupLimiter, lookupPublicResult);

export default router;
