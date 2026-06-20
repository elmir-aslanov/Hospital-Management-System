import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Doctor from '../../models/Doctor.model.js';
import * as appointmentsService from './appointments.service.js';

export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.createAppointment(req.body);
  res.status(201).json(new ApiResponse(201, appointment, 'Appointment booked successfully'));
});

export const getPublicSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  const result = await appointmentsService.getPublicSlots(doctorId, date);
  res.json(new ApiResponse(200, result));
});

export const createPublicAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentsService.createPublicAppointment(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Randevunuz uğurla yaradıldı'));
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
  const isPrivileged = req.user.role !== 'DOCTOR';
  let actingDoctorId = null;
  if (!isPrivileged) {
    const doctor = await Doctor.findOne({ userId: req.user.id }).select('_id');
    if (!doctor) throw new ApiError(404, 'Doctor profile not found for this user');
    actingDoctorId = doctor._id;
  }
  const appointment = await appointmentsService.updateAppointmentStatus(
    req.params.id,
    req.body.status,
    req.user.id,
    { actingDoctorId, isPrivileged }
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
    req.params.id, req.body, req.user.id || req.user._id, req
  );
  res.json(new ApiResponse(200, appointment, 'Appointment rescheduled'));
});

export const scanReminders = asyncHandler(async (req, res) => {
  const result = await appointmentsService.scanAndSendReminders();
  res.json(new ApiResponse(200, result, 'Reminder scan complete'));
});

export const checkInAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.checkInAppointment(
    req.params.id, req.user.id || req.user._id, req
  );
  res.json(new ApiResponse(200, appointment, 'Patient checked in'));
});
