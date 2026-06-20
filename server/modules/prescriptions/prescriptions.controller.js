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
  const prescription = await prescriptionsService.createPrescription(req.body, doctorId, req, req.user.id);
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
  const doctorId = req.user.role === 'DOCTOR'
    ? await resolveDoctorId(req.user.id)
    : null;
  const prescription = await prescriptionsService.getPrescriptionById(req.params.id, {
    viewerRole: req.user.role,
    doctorId,
  });
  res.status(200).json(new ApiResponse(200, prescription));
});

export const getPrescriptionsByVisit = asyncHandler(async (req, res) => {
  const doctorId = req.user.role === 'DOCTOR'
    ? await resolveDoctorId(req.user.id)
    : null;
  const prescriptions = await prescriptionsService.getPrescriptionsByVisit(req.params.visitId, {
    viewerRole: req.user.role,
    doctorId,
  });
  res.status(200).json(new ApiResponse(200, prescriptions));
});

export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const doctorId = req.user.role === 'DOCTOR'
    ? await resolveDoctorId(req.user.id)
    : null;
  const result = await prescriptionsService.getPatientPrescriptions(req.params.patientId, {
    ...req.query,
    viewerRole: req.user.role,
    doctorId,
  });
  res.status(200).json(new ApiResponse(200, result));
});

export const cancelPrescription = asyncHandler(async (req, res) => {
  const doctorId = req.user.role === 'DOCTOR'
    ? await resolveDoctorId(req.user.id)
    : null;

  const result = await prescriptionsService.cancelPrescription(req.params.id, {
    userRole: req.user.role,
    doctorId,
    userId: req.user.id,
    req,
    reason: req.body?.reason,
  });

  res.status(200).json(new ApiResponse(200, result, 'Prescription cancelled'));
});

export const archivePrescription = asyncHandler(async (req, res) => {
  const doctorId = req.user.role === 'DOCTOR'
    ? await resolveDoctorId(req.user.id)
    : null;

  const result = await prescriptionsService.archivePrescription(req.params.id, {
    userRole: req.user.role,
    doctorId,
    userId: req.user.id,
    req,
    reason: req.body?.reason,
  });

  res.status(200).json(new ApiResponse(200, result, 'Prescription archived'));
});
