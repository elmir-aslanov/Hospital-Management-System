import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import logAction from '../../utils/auditLogger.js';
import * as vitalsService from './vitals.service.js';

export const recordVitals = asyncHandler(async (req, res) => {
  const vitals = await vitalsService.recordVitals(req.body, req.user.id);

  logAction({
    userId: req.user.id, action: 'VITALS_RECORD',
    resourceType: 'Vitals', resourceId: vitals._id,
    description: `Vitals recorded for patient ${req.body.patientId}`,
    req,
  });

  res.status(201).json(new ApiResponse(201, vitals, 'Vitals recorded'));
});

export const getVitals = asyncHandler(async (req, res) => {
  const query = { ...req.query };

  if (req.user.role === 'DOCTOR') {
    query.doctorId = req.user.id;
  }

  const result = await vitalsService.getVitals(query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getVitalsByVisit = asyncHandler(async (req, res) => {
  const vitals = await vitalsService.getVitalsByVisit(req.params.visitId);
  res.status(200).json(new ApiResponse(200, vitals));
});

export const getPatientVitalsHistory = asyncHandler(async (req, res) => {
  const result = await vitalsService.getPatientVitalsHistory(req.params.patientId, req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getLatestVitals = asyncHandler(async (req, res) => {
  const vitals = await vitalsService.getLatestVitals(req.params.patientId);
  res.status(200).json(new ApiResponse(200, vitals));
});

export const getVitalsTrend = asyncHandler(async (req, res) => {
  const trend = await vitalsService.getVitalsTrend(req.params.patientId);
  res.status(200).json(new ApiResponse(200, trend));
});
