import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import * as svc     from './sitedoctors.service.js';
import SiteDoctor   from '../../models/SiteDoctor.model.js';

export const getPublicDoctors = asyncHandler(async (req, res) => {
  const limit   = parseInt(req.query.limit) || 8;
  const doctors = await svc.getPublicDoctors(limit);
  res.json(new ApiResponse(200, { doctors, total: doctors.length }, 'Həkimlər uğurla alındı.'));
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export const getAllDoctors = asyncHandler(async (_req, res) => {
  const doctors = await SiteDoctor.find()
    .populate('userId', 'fullName name surname email photoUrl phone isActive')
    .sort({ createdAt: -1 });
  res.json(doctors);
});

export const createDoctor = asyncHandler(async (req, res) => {
  const { fullName, specialization, department, experience, photoUrl, bio, isActive, order } = req.body;
  if (!fullName?.trim())       throw new ApiError(400, 'fullName tələb olunur');
  if (!specialization?.trim()) throw new ApiError(400, 'specialization tələb olunur');

  const doctor = await svc.createDoctor({
    name:       fullName.trim(),
    specialty:  specialization.trim(),
    department: department?.trim() || '',
    experience: Number(experience) || 0,
    image:      photoUrl?.trim() || '',
    bio:        bio?.trim() || '',
    isActive:   isActive ?? true,
    order:      Number(order) || 0,
  });

  res.status(201).json(new ApiResponse(201, doctor, 'Həkim uğurla yaradıldı'));
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const { fullName, specialization, department, experience, photoUrl, bio, isActive, order } = req.body;

  const update = {};
  if (fullName       !== undefined) update.name       = fullName.trim();
  if (specialization !== undefined) update.specialty  = specialization.trim();
  if (department     !== undefined) update.department = department.trim();
  if (experience     !== undefined) update.experience = Number(experience) || 0;
  if (photoUrl       !== undefined) update.image      = photoUrl.trim();
  if (bio            !== undefined) update.bio        = bio.trim();
  if (isActive       !== undefined) update.isActive   = isActive;
  if (order          !== undefined) update.order      = Number(order) || 0;

  const doctor = await svc.updateDoctor(req.params.id, update);
  res.json(new ApiResponse(200, doctor, 'Həkim uğurla yeniləndi'));
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  await svc.deleteDoctor(req.params.id);
  res.json(new ApiResponse(200, null, 'Həkim uğurla silindi'));
});
