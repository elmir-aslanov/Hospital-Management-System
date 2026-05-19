import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import * as svc     from './services.service.js';

export const getPublic = asyncHandler(async (req, res) => {
  const data = await svc.getPublic(req.query);
  res.json(new ApiResponse(200, data));
});

export const getAll = asyncHandler(async (req, res) => {
  const data = await svc.getAll();
  res.json(new ApiResponse(200, data));
});

export const getBySlug = asyncHandler(async (req, res) => {
  const data = await svc.getBySlug(req.params.slug);
  res.json(new ApiResponse(200, data));
});

export const create = asyncHandler(async (req, res) => {
  const data = await svc.create(req.body);
  res.status(201).json(new ApiResponse(201, data, 'Service created'));
});

export const update = asyncHandler(async (req, res) => {
  const data = await svc.update(req.params.id, req.body);
  res.json(new ApiResponse(200, data, 'Service updated'));
});

export const remove = asyncHandler(async (req, res) => {
  await svc.remove(req.params.id);
  res.json(new ApiResponse(200, null, 'Service deactivated'));
});
