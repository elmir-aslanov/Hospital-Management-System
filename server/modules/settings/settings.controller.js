import * as svc      from './settings.service.js';
import asyncHandler  from '../../utils/asyncHandler.js';
import ApiResponse   from '../../utils/ApiResponse.js';

export const getSettings = asyncHandler(async (req, res) => {
  const data = await svc.getSettings(req.query.group);
  res.json(new ApiResponse(200, data));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const data = await svc.updateSettings(req.body);
  res.json(new ApiResponse(200, data, 'Settings updated'));
});
