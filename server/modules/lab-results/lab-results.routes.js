import { Router } from 'express';
import {
  searchPublicResult, lookupPublicResult, verifyPublicLabResult, checkTestResultStatus, getResultPdf,
  getLabRequestSlots, getCurrentPatientForRequest, createPublicLabRequest,
} from '../lab/lab.controller.js';
import { labLookupLimiter } from '../../middleware/rateLimiter.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = Router();
const authenticateExistingPatientRequest = (req, res, next) => (
  req.body?.patientType === 'new' ? next() : authenticate(req, res, next)
);

router.post('/search', searchPublicResult);
router.post('/lookup', labLookupLimiter, lookupPublicResult);
router.post('/verify', labLookupLimiter, verifyPublicLabResult);
router.post('/test-status', labLookupLimiter, checkTestResultStatus);
router.get('/:id/pdf', getResultPdf);

// Public lab test self-request (book a sample-collection visit)
router.get('/requests/slots',           getLabRequestSlots);
router.get('/requests/current-patient', authenticate, getCurrentPatientForRequest);
router.post('/requests',                labLookupLimiter, authenticateExistingPatientRequest, createPublicLabRequest);

export default router;
