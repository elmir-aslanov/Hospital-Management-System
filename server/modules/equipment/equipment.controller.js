import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as equipmentService from './equipment.service.js';

export const createEquipment   = asyncHandler(async (req, res) => { res.status(201).json(new ApiResponse(201, await equipmentService.createEquipment(req.body), 'Equipment created')); });
export const getEquipmentList  = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await equipmentService.getEquipmentList(req.query))); });
export const getEquipmentById  = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await equipmentService.getEquipmentById(req.params.id))); });
export const getDueForSterilization = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await equipmentService.getDueForSterilization())); });

export const updateEquipmentStatus = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.updateEquipmentStatus(req.params.id, req.body.status, req.user.id, req);
  res.status(200).json(new ApiResponse(200, equipment, 'Status updated'));
});

export const startSterilization = asyncHandler(async (req, res) => {
  const cycle = await equipmentService.startSterilization(req.body, req.user.id, req);
  res.status(201).json(new ApiResponse(201, cycle, 'Sterilization cycle started'));
});

export const completeSterilization = asyncHandler(async (req, res) => {
  const cycle = await equipmentService.completeSterilization(req.params.cycleId, req.body, req.user.id, req);
  res.status(200).json(new ApiResponse(200, cycle, 'Sterilization cycle updated'));
});

export const getEquipmentCycles = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, await equipmentService.getEquipmentCycles(req.params.id, req.query)));
});
