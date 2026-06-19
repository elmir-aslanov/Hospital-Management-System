import { Router } from 'express';
import { searchPublicResult, lookupPublicResult, verifyPublicLabResult, checkTestResultStatus, getResultPdf } from '../lab/lab.controller.js';
import { labLookupLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/search', searchPublicResult);
router.post('/lookup', labLookupLimiter, lookupPublicResult);
router.post('/verify', labLookupLimiter, verifyPublicLabResult);
router.post('/test-status', labLookupLimiter, checkTestResultStatus);
router.get('/:id/pdf', getResultPdf);

export default router;
