import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as wardsService from './wards.service.js';

export const createWard = asyncHandler(async (req, res) => {
  const ward = await wardsService.createWard(req.body);
  res.status(201).json(new ApiResponse(201, ward, 'Ward created'));
});

export const getWards = asyncHandler(async (req, res) => {
  const wards = await wardsService.getWards();
  res.status(200).json(new ApiResponse(200, wards));
});

export const getWardById = asyncHandler(async (req, res) => {
  const ward = await wardsService.getWardById(req.params.id);
  res.status(200).json(new ApiResponse(200, ward));
});

export const getWardStats = asyncHandler(async (req, res) => {
  const stats = await wardsService.getWardStats();
  res.status(200).json(new ApiResponse(200, stats));
});

export const createRoom = asyncHandler(async (req, res) => {
  const room = await wardsService.createRoom({ ...req.body, wardId: req.params.id });
  res.status(201).json(new ApiResponse(201, room, 'Room created'));
});

export const getRoomsByWard = asyncHandler(async (req, res) => {
  const rooms = await wardsService.getRoomsByWard(req.params.id);
  res.status(200).json(new ApiResponse(200, rooms));
});

export const createBed = asyncHandler(async (req, res) => {
  const bed = await wardsService.createBed({ ...req.body, wardId: req.params.id });
  res.status(201).json(new ApiResponse(201, bed, 'Bed created'));
});

export const getBedsByWard = asyncHandler(async (req, res) => {
  const beds = await wardsService.getBedsByWard(req.params.id);
  res.status(200).json(new ApiResponse(200, beds));
});

export const updateBedStatus = asyncHandler(async (req, res) => {
  const bed = await wardsService.updateBedStatus(
    req.params.bedId,
    req.body.status,
    req.body.patientId
  );
  res.status(200).json(new ApiResponse(200, bed, 'Bed status updated'));
});
