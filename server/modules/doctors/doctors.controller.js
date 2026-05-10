import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as doctorsService from './doctors.service.js';

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.createDoctor(req.body);
  res.status(201).json(new ApiResponse(201, doctor, 'Doctor profile created'));
});

export const getDoctors = asyncHandler(async (req, res) => {
  const result = await doctorsService.getDoctors(req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.getDoctorById(req.params.id);
  res.status(200).json(new ApiResponse(200, doctor));
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.updateDoctor(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, doctor, 'Doctor updated'));
});

export const getDoctorSchedule = asyncHandler(async (req, res) => {
  const schedule = await doctorsService.getDoctorSchedule(req.params.id);
  res.status(200).json(new ApiResponse(200, schedule));
});

export const updateDoctorSchedule = asyncHandler(async (req, res) => {
  const schedule = await doctorsService.updateDoctorSchedule(req.params.id, req.body.schedule);
  res.status(200).json(new ApiResponse(200, schedule, 'Schedule updated'));
});

export const getDoctorAvailability = asyncHandler(async (req, res) => {
  const slots = await doctorsService.getDoctorAvailability(req.params.id, req.query.date);
  res.status(200).json(new ApiResponse(200, slots));
});
