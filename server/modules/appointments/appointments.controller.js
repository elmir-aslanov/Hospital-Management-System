import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as appointmentsService from './appointments.service.js';

export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.createAppointment(req.body);
  res.status(201).json(new ApiResponse(201, appointment, 'Appointment booked successfully'));
});

export const getAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentsService.getAppointments(req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.getAppointmentById(req.params.id);
  res.status(200).json(new ApiResponse(200, appointment));
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.updateAppointmentStatus(
    req.params.id,
    req.body.status,
    req.user.id
  );
  res.status(200).json(new ApiResponse(200, appointment, 'Status updated'));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.cancelAppointment(
    req.params.id,
    req.user.id,
    req.body.cancelReason
  );
  res.status(200).json(new ApiResponse(200, appointment, 'Appointment cancelled'));
});

export const getPatientAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentsService.getPatientAppointments(
    req.params.patientId,
    req.query
  );
  res.status(200).json(new ApiResponse(200, result));
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentsService.getDoctorAppointments(
    req.params.doctorId,
    req.query
  );
  res.status(200).json(new ApiResponse(200, result));
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.rescheduleAppointment(
    req.params.id, req.body, req.user.id || req.user._id
  );
  res.json(new ApiResponse(200, appointment, 'Appointment rescheduled'));
});
