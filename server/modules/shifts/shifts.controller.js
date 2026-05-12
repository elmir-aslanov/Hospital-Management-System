import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as shiftsService from './shifts.service.js';

export const createShift = asyncHandler(async (req, res) => {
  const shift = await shiftsService.createShift(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, shift, 'Shift created'));
});

export const getShifts = asyncHandler(async (req, res) => {
  const result = await shiftsService.getShifts(req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const getMyShifts = asyncHandler(async (req, res) => {
  const result = await shiftsService.getMyShifts(req.user.id, req.query);
  res.status(200).json(new ApiResponse(200, result));
});

export const updateShiftStatus = asyncHandler(async (req, res) => {
  const shift = await shiftsService.updateShiftStatus(req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, shift, 'Status updated'));
});

export const getTodayShifts = asyncHandler(async (req, res) => {
  const shifts = await shiftsService.getTodayShifts(req.query.wardId);
  res.status(200).json(new ApiResponse(200, shifts));
});

export const getWeeklySchedule = asyncHandler(async (req, res) => {
  const schedule = await shiftsService.getWeeklySchedule(req.params.userId);
  res.status(200).json(new ApiResponse(200, schedule));
});
