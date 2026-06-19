import { Router } from 'express';
import {
  searchPublicResult, lookupPublicResult, verifyPublicLabResult, checkTestResultStatus, getResultPdf,
  getLabRequestSlots, lookupExistingPatientForRequest, createPublicLabRequest,
} from '../lab/lab.controller.js';
import { labLookupLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/search', searchPublicResult);
router.post('/lookup', labLookupLimiter, lookupPublicResult);
router.post('/verify', labLookupLimiter, verifyPublicLabResult);
router.post('/test-status', labLookupLimiter, checkTestResultStatus);
router.get('/:id/pdf', getResultPdf);

// Public lab test self-request (book a sample-collection visit)
router.get('/requests/slots',          getLabRequestSlots);
router.post('/requests/lookup-patient', labLookupLimiter, lookupExistingPatientForRequest);
router.post('/requests',               labLookupLimiter, createPublicLabRequest);

export default router;
