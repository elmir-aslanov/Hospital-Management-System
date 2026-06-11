import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Doctor from '../../models/Doctor.model.js';
import * as prescriptionsService from './prescriptions.service.js';

const resolveDoctorId = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).select('_id');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found for this user');
  return doctor._id;
};

export const createPrescription = asyncHandler(async (req, res) => {
  const doctorId = await resolveDoctorId(req.user.id);
  const prescription = await prescriptionsService.createPrescription(req.body, doctorId, req);
  res.status(201).json(new ApiResponse(201, prescription, 'Prescription created'));
});

export const getPrescriptions = asyncHandler(async (req, res) => {
  const query = { ...req.query };

  if (req.user.role === 'DOCTOR') {
    query.doctorId = await resolveDoctorId(req.user.id);
  }

  const result = await prescriptionsService.getPrescriptions(query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await prescriptionsService.getPrescriptionById(req.params.id);
  res.status(200).json(new ApiResponse(200, prescription));
});

export const getPrescriptionsByVisit = asyncHandler(async (req, res) => {
  const prescriptions = await prescriptionsService.getPrescriptionsByVisit(req.params.visitId);
  res.status(200).json(new ApiResponse(200, prescriptions));
});

export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const result = await prescriptionsService.getPatientPrescriptions(req.params.patientId, req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const deletePrescription = asyncHandler(async (req, res) => {
  const doctorId = req.user.role === 'DOCTOR'
    ? await resolveDoctorId(req.user.id)
    : null;

  const result = await prescriptionsService.deletePrescription(req.params.id, {
    userRole: req.user.role,
    doctorId,
    userId: req.user.id,
    req,
  });

  res.status(200).json(new ApiResponse(200, result, 'Prescription deleted'));
});
