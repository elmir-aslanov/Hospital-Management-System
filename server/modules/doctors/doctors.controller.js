import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import * as doctorsService from './doctors.service.js';
import Doctor from '../../models/Doctor.model.js';

// A DOCTOR caller may only edit their own profile/schedule — ADMIN/SUPER_ADMIN
// are unrestricted. Mirrors the ownership pattern used in EHR/prescriptions.
const assertOwnDoctorProfile = async (req) => {
  if (req.user.role !== 'DOCTOR') return;
  const own = await Doctor.findOne({ userId: req.user.id }).select('_id');
  if (!own || String(own._id) !== String(req.params.id)) {
    throw new ApiError(403, 'You can only manage your own doctor profile');
  }
};

export const getPublicDoctors = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 8;
  const data  = await doctorsService.getPublicDoctors(limit);
  res.json(new ApiResponse(200, data));
});

export const getAllPublicDoctors = asyncHandler(async (req, res) => {
  const data = await doctorsService.getAllPublicDoctors(req.query);
  res.json(new ApiResponse(200, data));
});

export const getPublicDoctorById = asyncHandler(async (req, res) => {
  const data = await doctorsService.getPublicDoctorById(req.params.id);
  res.json(new ApiResponse(200, data));
});

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.createDoctor(req.body, req.file);
  res.status(201).json(new ApiResponse(201, doctor, 'Həkim uğurla əlavə edildi'));
});

export const getDoctors = asyncHandler(async (req, res) => {
  const { specialization, isAvailable, page, limit } = req.query;
  const result = await doctorsService.getDoctors({ specialization, isAvailable, page, limit });
  res.status(200).json(new ApiResponse(200, result));
});

export const getAllDoctors = asyncHandler(async (req, res) => {
  const Doctor = (await import('../../models/Doctor.model.js')).default;
  const doctors = await Doctor.find()
    .populate({
      path: 'userId',
      select: 'fullName name surname email photoUrl phone'
    })
    .sort({ createdAt: -1 });
  res.json(doctors);
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.getDoctorById(req.params.id);
  res.status(200).json(new ApiResponse(200, doctor));
});

export const updateDoctor = asyncHandler(async (req, res) => {
  await assertOwnDoctorProfile(req);
  const doctor = await doctorsService.updateDoctor(req.params.id, req.body, req.file);
  res.status(200).json(new ApiResponse(200, doctor, 'Həkim məlumatları yeniləndi'));
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  await doctorsService.deleteDoctor(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Həkim silindi'));
});

export const getDoctorSchedule = asyncHandler(async (req, res) => {
  const schedule = await doctorsService.getDoctorSchedule(req.params.id);
  res.status(200).json(new ApiResponse(200, schedule));
});

export const updateDoctorSchedule = asyncHandler(async (req, res) => {
  await assertOwnDoctorProfile(req);
  const schedule = await doctorsService.updateDoctorSchedule(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, schedule, 'Schedule updated'));
});

export const getDoctorAvailability = asyncHandler(async (req, res) => {
  const availability = await doctorsService.getDoctorAvailability(req.params.id, req.query.date);
  res.status(200).json(new ApiResponse(200, availability));
});

export const getDoctorsByDepartment = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ departmentId: req.params.departmentId, isActive: true })
    .populate('userId', 'fullName name surname email phone photoUrl')
    .populate({ path: 'departmentId', select: 'name slug icon' })
    .sort({ order: 1, averageRating: -1 });
  res.json(new ApiResponse(200, doctors));
});

export const adminCreateDoctor = asyncHandler(async (req, res) => {
  const result = await doctorsService.adminCreateDoctor(req.body, req.file);
  res.status(201).json(new ApiResponse(201, result, 'Həkim profili yaradıldı'));
});
