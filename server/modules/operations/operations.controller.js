import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as operationsService from './operations.service.js';

export const createOperation = asyncHandler(async (req, res) => {
  const operation = await operationsService.createOperation(req.body, req.user.id, req);
  res.status(201).json(new ApiResponse(201, operation, 'Operation scheduled'));
});

export const getOperations  = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await operationsService.getOperations(req.query))); });
export const getOperationById = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await operationsService.getOperationById(req.params.id))); });

export const updateOperationStatus = asyncHandler(async (req, res) => {
  const operation = await operationsService.updateOperationStatus(req.params.id, req.body, req.user.id, req);
  res.status(200).json(new ApiResponse(200, operation, 'Status updated'));
});

export const rescheduleOperation = asyncHandler(async (req, res) => {
  const operation = await operationsService.rescheduleOperation(req.params.id, req.body, req.user.id, req);
  res.status(200).json(new ApiResponse(200, operation, 'Operation rescheduled'));
});
