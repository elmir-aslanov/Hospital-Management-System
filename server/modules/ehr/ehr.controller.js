import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Doctor from '../../models/Doctor.model.js';
import * as ehrService from './ehr.service.js';

const resolveDoctorId = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).select('_id');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found for this user');
  return doctor._id;
};

export const createRecord = asyncHandler(async (req, res) => {
  const doctorId = await resolveDoctorId(req.user._id);
  const record = await ehrService.createRecord(req.body, doctorId);
  res.status(201).json(new ApiResponse(201, record, 'Medical record created'));
});

export const getRecordsByPatient = asyncHandler(async (req, res) => {
  const records = await ehrService.getRecordsByPatient(req.params.patientId, req.query);
  res.status(200).json(new ApiResponse(200, records));
});

export const getRecordById = asyncHandler(async (req, res) => {
  const record = await ehrService.getRecordById(req.params.id);
  res.status(200).json(new ApiResponse(200, record));
});
