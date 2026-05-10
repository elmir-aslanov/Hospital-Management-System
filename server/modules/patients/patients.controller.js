import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as patientsService from './patients.service.js';

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await patientsService.createPatient(req.body);
  res.status(201).json(new ApiResponse(201, patient, 'Patient profile created'));
});

export const getPatients = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await patientsService.getPatients({ page, limit });
  res.status(200).json(new ApiResponse(200, result));
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientsService.getPatientById(req.params.id);
  res.status(200).json(new ApiResponse(200, patient));
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientsService.updatePatient(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, patient, 'Patient updated'));
});

export const addMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await patientsService.addMedicalHistory(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, patient, 'Medical history added'));
});

export const getMedicalHistory = asyncHandler(async (req, res) => {
  const history = await patientsService.getMedicalHistory(req.params.id);
  res.status(200).json(new ApiResponse(200, history));
});

export const searchPatients = asyncHandler(async (req, res) => {
  const { query, condition, page, limit } = req.query;
  const result = await patientsService.searchPatients({ query, condition, page, limit });
  res.status(200).json(new ApiResponse(200, result));
});
