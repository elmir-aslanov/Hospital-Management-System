import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Patient from '../../models/Patient.model.js';
import * as ratingsService from './ratings.service.js';

const resolvePatientId = async (userId) => {
  const patient = await Patient.findOne({ userId }).select('_id');
  if (!patient) throw new ApiError(404, 'Patient profile not found for this user');
  return patient._id;
};

export const createRating = asyncHandler(async (req, res) => {
  const patientId = await resolvePatientId(req.user.id);
  const rating = await ratingsService.createRating({ ...req.body, patientId });
  res.status(201).json(new ApiResponse(201, rating, 'Rating submitted'));
});

export const getDoctorRatings = asyncHandler(async (req, res) => {
  const result = await ratingsService.getDoctorRatings(req.params.doctorId, req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getAllRatings = asyncHandler(async (req, res) => {
  const data = await ratingsService.getAllRatings(req.query);
  res.json(new ApiResponse(200, data));
});

export const getMyRatings = asyncHandler(async (req, res) => {
  const patientId = await resolvePatientId(req.user.id);
  const result = await ratingsService.getMyRatings(patientId, req.query);
  res.status(200).json(new ApiResponse(200, result));
});
