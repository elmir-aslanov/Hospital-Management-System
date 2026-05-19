import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import * as svc     from './sitedoctors.service.js';

// ── Public ────────────────────────────────────────────────────────────────────

export const getPublicDoctors = asyncHandler(async (req, res) => {
  const doctors = await svc.getPublicDoctors(req.query.limit);
  res.json(new ApiResponse(200, doctors));
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await svc.getAllDoctors();
  res.json(new ApiResponse(200, doctors));
});

export const createDoctor = asyncHandler(async (req, res) => {
  const doc = await svc.createDoctor(req.body);
  res.status(201).json(new ApiResponse(201, doc, 'Doctor created'));
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doc = await svc.updateDoctor(req.params.id, req.body);
  res.json(new ApiResponse(200, doc, 'Doctor updated'));
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  await svc.deleteDoctor(req.params.id);
  res.json(new ApiResponse(200, null, 'Doctor deleted'));
});
