import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as svc from './reports.service.js';

export const getSummary             = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await svc.getSummary(req.query))));
export const getAppointmentsReport  = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await svc.getAppointmentsReport(req.query))));
export const getLabReport           = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await svc.getLabReport(req.query))));
export const getDocumentsReport     = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await svc.getDocumentsReport(req.query))));
export const getDoctorActivity      = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await svc.getDoctorActivityReport(req.query))));
export const getDepartmentActivity  = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await svc.getDepartmentActivityReport(req.query))));
