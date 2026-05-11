import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as admissionsService from './admissions.service.js';

export const admitPatient = asyncHandler(async (req, res) => {
  const admission = await admissionsService.admitPatient(req.body, req.user.id, req);
  res.status(201).json(new ApiResponse(201, admission, 'Patient admitted successfully'));
});

export const getAdmissions = asyncHandler(async (req, res) => {
  const result = await admissionsService.getAdmissions(req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getAdmissionById = asyncHandler(async (req, res) => {
  const admission = await admissionsService.getAdmissionById(req.params.id);
  res.status(200).json(new ApiResponse(200, admission));
});

export const dischargePatient = asyncHandler(async (req, res) => {
  const admission = await admissionsService.dischargePatient(req.params.id, req.body, req.user.id, req);
  res.status(200).json(new ApiResponse(200, admission, 'Patient discharged successfully'));
});

export const getActiveAdmissions = asyncHandler(async (req, res) => {
  const admissions = await admissionsService.getActiveAdmissions();
  res.status(200).json(new ApiResponse(200, admissions));
});

export const getPatientAdmissionHistory = asyncHandler(async (req, res) => {
  const admissions = await admissionsService.getPatientAdmissionHistory(req.params.patientId);
  res.status(200).json(new ApiResponse(200, admissions));
});
