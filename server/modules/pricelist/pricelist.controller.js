import * as svc      from './pricelist.service.js';
import asyncHandler  from '../../utils/asyncHandler.js';
import ApiResponse   from '../../utils/ApiResponse.js';

export const getPrices   = asyncHandler(async (req, res) => { const d = await svc.getPrices(req.query);                   res.json(new ApiResponse(200, d)); });
export const createPrice = asyncHandler(async (req, res) => { const d = await svc.createPrice(req.body);                  res.status(201).json(new ApiResponse(201, d, 'Created')); });
export const updatePrice = asyncHandler(async (req, res) => { const d = await svc.updatePrice(req.params.id, req.body);   res.json(new ApiResponse(200, d, 'Updated')); });
export const deletePrice = asyncHandler(async (req, res) => { await svc.deletePrice(req.params.id);                       res.json(new ApiResponse(200, null, 'Deleted')); });
