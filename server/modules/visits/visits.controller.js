import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Doctor from '../../models/Doctor.model.js';
import * as visitsService from './visits.service.js';

const resolveDoctorId = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).select('_id');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found for this user');
  return doctor._id;
};

export const createVisit = asyncHandler(async (req, res) => {
  const visit = await visitsService.createVisit(req.body, req);
  res.status(201).json(new ApiResponse(201, visit, 'Visit created'));
});

export const getVisitById = asyncHandler(async (req, res) => {
  const visit = await visitsService.getVisitById(req.params.id);
  res.status(200).json(new ApiResponse(200, visit));
});

export const updateVisit = asyncHandler(async (req, res) => {
  const visit = await visitsService.updateVisit(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, visit, 'Visit updated'));
});

export const closeVisit = asyncHandler(async (req, res) => {
  const doctorId = await resolveDoctorId(req.user.id);
  const visit = await visitsService.closeVisit(req.params.id, doctorId, req);
  res.status(200).json(new ApiResponse(200, visit, 'Visit closed'));
});

export const getPatientVisits = asyncHandler(async (req, res) => {
  const doctorId = req.user.role === 'DOCTOR'
    ? await resolveDoctorId(req.user.id)
    : null;
  const result = await visitsService.getPatientVisits(req.params.patientId, {
    ...req.query,
    doctorId,
  });
  res.status(200).json(new ApiResponse(200, result));
});

export const getDoctorVisits = asyncHandler(async (req, res) => {
  const requestedDoctorId = req.user.role === 'DOCTOR'
    ? await resolveDoctorId(req.user.id)
    : req.params.doctorId;
  const result = await visitsService.getDoctorVisits(requestedDoctorId, req.query);
  res.status(200).json(new ApiResponse(200, result));
});
