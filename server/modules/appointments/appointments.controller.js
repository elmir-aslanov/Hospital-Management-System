import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as appointmentsService from './appointments.service.js';

export const createAppointment = asyncHandler(async (req, res) => {
  const appt = await appointmentsService.createAppointment(req.body);
  res.status(201).json(new ApiResponse(201, appt, 'Appointment created'));
});

export const getAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentsService.getAppointments(req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appt = await appointmentsService.getAppointmentById(req.params.id);
  res.status(200).json(new ApiResponse(200, appt));
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appt = await appointmentsService.updateAppointmentStatus(req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, appt, 'Status updated'));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  await appointmentsService.cancelAppointment(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Appointment cancelled'));
});
