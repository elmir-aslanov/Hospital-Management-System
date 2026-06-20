import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import Appointment from '../../models/Appointment.model.js';
import * as patientsService from './patients.service.js';

const ensurePatientOwnership = (req, patient) => {
  if (req.user.role !== 'PATIENT') return;

  const ownerId = patient?.userId?._id || patient?.userId;
  if (!ownerId || String(ownerId) !== String(req.user.id)) {
    throw new ApiError(403, 'Forbidden: patient record does not belong to you');
  }
};

// A DOCTOR may only view the full clinical timeline of a patient they have
// actually treated — mirrors the same Appointment-based check used for
// EHR/consent forms. ADMIN/SUPER_ADMIN/BAS_HEKIM/NURSE/RECEPTIONIST are
// unrestricted (RECEPTIONIST is further source-limited inside the service).
const ensureDoctorTreatedPatient = async (req, patientId) => {
  if (req.user.role !== 'DOCTOR') return;
  const doctor = await Doctor.findOne({ userId: req.user.id }).select('_id');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found for this user');
  const hasAppointment = await Appointment.exists({ doctorId: doctor._id, patientId });
  if (!hasAppointment) throw new ApiError(403, 'Bu pasiyent sizə aid deyil');
};

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await patientsService.createPatient(req.body);
  res.status(201).json(new ApiResponse(201, patient, 'Patient profile created'));
});

export const adminCreatePatient = asyncHandler(async (req, res) => {
  const { fullName, email, phone, bloodGroup } = req.body;
  const patient = await patientsService.adminCreatePatient({ fullName, email, phone, bloodGroup });
  res.status(201).json(new ApiResponse(201, patient, 'Pasiyent uğurla yaradıldı'));
});

export const getPatients = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await patientsService.getPatients({ page, limit });
  res.status(200).json(new ApiResponse(200, result));
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientsService.getPatientById(req.params.id);
  ensurePatientOwnership(req, patient);
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
  const { q, query, condition, page, limit } = req.query;
  const result = await patientsService.searchPatients({ query: query || q, condition, page, limit });
  res.status(200).json(new ApiResponse(200, result));
});

export const searchPublic = asyncHandler(async (req, res) => {
  const data = await patientsService.searchPublic(req.query);
  res.json(new ApiResponse(200, data));
});

export const getPatientByUserId = asyncHandler(async (req, res) => {
  if (req.user.role === 'PATIENT' && String(req.params.userId) !== String(req.user.id)) {
    throw new ApiError(403, 'Forbidden: patient record does not belong to you');
  }

  const patient = await Patient.findOne({ userId: req.params.userId })
    .populate('userId', 'fullName email avatar phone')
    .lean();
  if (!patient) throw new ApiError(404, 'Pasiyent profili tapılmadı.');
  res.json(new ApiResponse(200, { patient }, 'Uğurla alındı.'));
});

export const getPatientTimeline = asyncHandler(async (req, res) => {
  await ensureDoctorTreatedPatient(req, req.params.patientId);
  const { type, source, dateFrom, dateTo, page, limit } = req.query;
  const result = await patientsService.getPatientTimeline(req.params.patientId, {
    type, source, dateFrom, dateTo, page, limit, viewerRole: req.user.role,
  });
  res.json(new ApiResponse(200, result));
});
