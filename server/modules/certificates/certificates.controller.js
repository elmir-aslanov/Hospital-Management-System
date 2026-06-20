import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Doctor from '../../models/Doctor.model.js';
import * as certificatesService from './certificates.service.js';

const resolveDoctorId = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).select('_id');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found');
  return doctor._id;
};

export const createCertificate = asyncHandler(async (req, res) => {
  const doctorId = await resolveDoctorId(req.user.id);
  const cert = await certificatesService.createCertificate(req.body, doctorId);
  res.status(201).json(new ApiResponse(201, cert, 'Certificate generated'));
});

export const getCertificateById = asyncHandler(async (req, res) => {
  const cert = await certificatesService.getCertificateById(req.params.id, req.user.role);
  res.status(200).json(new ApiResponse(200, cert));
});

export const getPatientCertificates = asyncHandler(async (req, res) => {
  const result = await certificatesService.getPatientCertificates(req.params.patientId, req.query, req.user.role);
  res.status(200).json(new ApiResponse(200, result));
});

export const downloadCertificate = asyncHandler(async (req, res) => {
  const cert = await certificatesService.getCertificateById(req.params.id, req.user.role);
  res.status(200).json(new ApiResponse(200, { pdfUrl: cert.pdfUrl, certificateNumber: cert.certificateNumber }));
});
