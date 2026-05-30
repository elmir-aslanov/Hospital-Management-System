import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as doctorsService from './doctors.service.js';

export const getPublicDoctors = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 8;
  const data  = await doctorsService.getPublicDoctors(limit);
  res.json(new ApiResponse(200, data));
});

export const getAllPublicDoctors = asyncHandler(async (req, res) => {
  const data = await doctorsService.getAllPublicDoctors();
  res.json(new ApiResponse(200, data));
});

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.createDoctor(req.body);
  res.status(201).json(new ApiResponse(201, doctor, 'Doctor profile created'));
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
  const doctor = await doctorsService.updateDoctor(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, doctor, 'Doctor updated'));
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  await doctorsService.deleteDoctor(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Doctor deleted'));
});

export const getDoctorSchedule = asyncHandler(async (req, res) => {
  const schedule = await doctorsService.getDoctorSchedule(req.params.id);
  res.status(200).json(new ApiResponse(200, schedule));
});

export const updateDoctorSchedule = asyncHandler(async (req, res) => {
  const schedule = await doctorsService.updateDoctorSchedule(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, schedule, 'Schedule updated'));
});

export const getDoctorAvailability = asyncHandler(async (req, res) => {
  const availability = await doctorsService.getDoctorAvailability(req.params.id, req.query.date);
  res.status(200).json(new ApiResponse(200, availability));
});
