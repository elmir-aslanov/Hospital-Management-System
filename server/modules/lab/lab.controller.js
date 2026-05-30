import * as svc     from './lab.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';

const uid = (req) => req.user.id || req.user._id;

export const createOrder       = asyncHandler(async (req, res) => { const d = await svc.createOrder(req.body, uid(req));       res.status(201).json(new ApiResponse(201, d, 'Order created')); });
export const getOrders         = asyncHandler(async (req, res) => { const d = await svc.getOrders(req.query);                  res.json(new ApiResponse(200, d)); });
export const getOrderById      = asyncHandler(async (req, res) => { const d = await svc.getOrderById(req.params.id);           res.json(new ApiResponse(200, d)); });
export const updateOrderStatus = asyncHandler(async (req, res) => { const d = await svc.updateOrderStatus(req.params.id, req.body.status); res.json(new ApiResponse(200, d, 'Status updated')); });
export const deleteOrder       = asyncHandler(async (req, res) => { await svc.deleteOrder(req.params.id);                      res.json(new ApiResponse(200, null, 'Order deleted')); });
export const createResult      = asyncHandler(async (req, res) => { const d = await svc.createResult(req.body, uid(req));      res.status(201).json(new ApiResponse(201, d, 'Result saved')); });
export const getResultByOrder  = asyncHandler(async (req, res) => { const d = await svc.getResultByOrder(req.params.orderId);  res.json(new ApiResponse(200, d)); });
export const getPatientResults = asyncHandler(async (req, res) => { const d = await svc.getPatientResults(req.params.patientId); res.json(new ApiResponse(200, d)); });
export const verifyResult      = asyncHandler(async (req, res) => { const d = await svc.verifyResult(req.params.id, uid(req)); res.json(new ApiResponse(200, d, 'Verified')); });
export const getLabSummary     = asyncHandler(async (req, res) => { const d = await svc.getLabSummary();                       res.json(new ApiResponse(200, d)); });
