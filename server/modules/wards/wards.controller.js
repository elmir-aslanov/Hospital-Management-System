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

export const getBedsByWard = asyncHandler(async (req, res) => {
  const beds = await wardsService.getBedsByWard(req.params.id);
  res.status(200).json(new ApiResponse(200, beds));
});

export const updateBedStatus = asyncHandler(async (req, res) => {
  const bed = await wardsService.updateBedStatus(
    req.params.id,
    req.params.bedId,
    req.body.status,
    req.body.patientId
  );
  res.status(200).json(new ApiResponse(200, bed, 'Bed status updated'));
});
