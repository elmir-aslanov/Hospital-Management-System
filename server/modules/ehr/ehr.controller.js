import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Doctor from '../../models/Doctor.model.js';
import Patient from '../../models/Patient.model.js';
import MedicalRecord from '../../models/MedicalRecord.model.js';
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
  const { type, search, limit, page } = req.query;
  const result = await ehrService.getRecordsByPatient(req.params.patientId, { type, search, limit, page });
  res.status(200).json(new ApiResponse(200, result));
});

export const getRecordById = asyncHandler(async (req, res) => {
  const record = await ehrService.getRecordById(req.params.id);
  res.status(200).json(new ApiResponse(200, record));
});

export const getPatientEHR   = asyncHandler(async (req, res) => { const d = await ehrService.getPatientEHR(req.params.patientId, req.query, req.user.role);  res.json(new ApiResponse(200, d)); });
export const getEHRSummary   = asyncHandler(async (req, res) => { const d = await ehrService.getEHRSummary(req.params.patientId);              res.json(new ApiResponse(200, d)); });
export const addEHRRecord = asyncHandler(async (req, res) => {
  const isPrivileged = req.user.role !== 'DOCTOR';
  const doctorId = isPrivileged ? null : await resolveDoctorId(req.user.id || req.user._id);
  const d = await ehrService.addEHRRecord(req.body, { doctorId, isPrivileged, userId: req.user.id || req.user._id, req });
  res.status(201).json(new ApiResponse(201, d, 'Qeyd əlavə edildi'));
});
export const updateEHRRecord = asyncHandler(async (req, res) => {
  const isPrivileged = req.user.role !== 'DOCTOR';
  const doctorId = isPrivileged ? null : await resolveDoctorId(req.user.id || req.user._id);
  const d = await ehrService.updateEHRRecord(req.params.id, req.body, { doctorId, isPrivileged, userId: req.user.id || req.user._id, req });
  res.json(new ApiResponse(200, d, 'Qeyd yeniləndi'));
});
export const deleteEHRRecord = asyncHandler(async (req, res) => { await ehrService.deleteEHRRecord(req.params.id);                             res.json(new ApiResponse(200, null, 'Qeyd silindi')); });

export const getMyRecords = asyncHandler(async (req, res) => {
  const doctorId = await resolveDoctorId(req.user.id || req.user._id);
  const d = await ehrService.getMyRecords(doctorId, req.query);
  res.json(new ApiResponse(200, d));
});

export const submitEHRRecord = asyncHandler(async (req, res) => {
  const isPrivileged = req.user.role !== 'DOCTOR';
  const doctorId = isPrivileged ? null : await resolveDoctorId(req.user.id || req.user._id);
  const record = await ehrService.submitEHRRecord(req.params.id, {
    doctorId, isPrivileged, userId: req.user.id || req.user._id, req,
  });
  res.json(new ApiResponse(200, record, 'Qeyd təsdiqə göndərildi'));
});

export const getPatientResults = asyncHandler(async (req, res) => {
  const { patientId, dateOfBirth, phone } = req.query;

  let patient = null;

  if (phone) {
    patient = await Patient.findOne({
      phone: { $regex: phone.replace(/\s/g, ''), $options: 'i' },
    }).populate('userId', 'fullName email').lean();
  } else if (patientId) {
    patient = await Patient.findOne({ patientId })
      .populate('userId', 'fullName email').lean();

    if (patient && dateOfBirth) {
      const dob = new Date(patient.dateOfBirth).toISOString().split('T')[0];
      if (dob !== dateOfBirth) {
        throw new ApiError(401, 'Məlumatlar uyğun gəlmir.');
      }
    }
  } else {
    throw new ApiError(400, 'Pasiyent ID və ya telefon nömrəsi tələb olunur.');
  }

  if (!patient) throw new ApiError(404, 'Pasiyent tapılmadı.');

  const records = await MedicalRecord.find({ patientId: patient._id })
    .populate('doctorId', 'specialization')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json(new ApiResponse(200, {
    patient: {
      fullName:    patient.userId?.fullName,
      dateOfBirth: patient.dateOfBirth,
      patientId:   patient.patientId,
      phone:       patient.phone,
    },
    records,
    total: records.length,
  }, 'Nəticələr uğurla alındı.'));
});
