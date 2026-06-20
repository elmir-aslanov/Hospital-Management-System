import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Doctor from '../../models/Doctor.model.js';
import * as svc from './consent-forms.service.js';

const uid = (req) => req.user.id || req.user._id;

const resolveDoctorContext = async (req) => {
  const isPrivileged = req.user.role !== 'DOCTOR';
  if (isPrivileged) return { isPrivileged, doctorId: null };
  const doctor = await Doctor.findOne({ userId: uid(req) }).select('_id');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found for this user');
  return { isPrivileged, doctorId: doctor._id };
};

export const createConsentForm = asyncHandler(async (req, res) => {
  const { isPrivileged, doctorId } = await resolveDoctorContext(req);
  const form = await svc.createConsentForm(req.body, { doctorId, isPrivileged, userId: uid(req), req });
  res.status(201).json(new ApiResponse(201, form, 'Consent form created'));
});

export const updateConsentForm = asyncHandler(async (req, res) => {
  const { isPrivileged, doctorId } = await resolveDoctorContext(req);
  const form = await svc.updateConsentForm(req.params.id, req.body, { doctorId, isPrivileged });
  res.json(new ApiResponse(200, form, 'Consent form updated'));
});

export const sendConsentForm = asyncHandler(async (req, res) => {
  const { isPrivileged, doctorId } = await resolveDoctorContext(req);
  const form = await svc.sendConsentForm(req.params.id, { doctorId, isPrivileged, userId: uid(req), req });
  res.json(new ApiResponse(200, form, 'Consent form sent to patient'));
});

export const respondToConsentForm = asyncHandler(async (req, res) => {
  const form = await svc.respondToConsentForm(req.params.id, req.body, uid(req), req);
  res.json(new ApiResponse(200, form, 'Response recorded'));
});

export const archiveConsentForm = asyncHandler(async (req, res) => {
  const { isPrivileged, doctorId } = await resolveDoctorContext(req);
  const form = await svc.archiveConsentForm(req.params.id, { doctorId, isPrivileged, userId: uid(req), req });
  res.json(new ApiResponse(200, form, 'Consent form archived'));
});

export const getMyConsentForms = asyncHandler(async (req, res) => {
  const data = await svc.getMyConsentForms(uid(req), req.query);
  res.json(new ApiResponse(200, data));
});

export const getDoctorConsentForms = asyncHandler(async (req, res) => {
  const { doctorId } = await resolveDoctorContext(req);
  const data = await svc.getDoctorConsentForms(doctorId, req.query);
  res.json(new ApiResponse(200, data));
});

export const getConsentFormById = asyncHandler(async (req, res) => {
  const { isPrivileged, doctorId } = await resolveDoctorContext(req);
  const form = await svc.getConsentFormById(req.params.id, { doctorId, isPrivileged });
  res.json(new ApiResponse(200, form));
});
