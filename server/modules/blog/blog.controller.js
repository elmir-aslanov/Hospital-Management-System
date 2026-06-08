import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import * as svc     from './blog.service.js';

export const getPublished = asyncHandler(async (req, res) => {
  const data = await svc.getPublished(req.query);
  res.json(new ApiResponse(200, data));
});

export const getBySlug = asyncHandler(async (req, res) => {
  const data = await svc.getBySlug(req.params.slug);
  res.json(new ApiResponse(200, data));
});

export const getAll = asyncHandler(async (req, res) => {
  const { page, limit, search, category } = req.query;
  const data = await svc.getAll({ page, limit, search, category });
  res.json(new ApiResponse(200, data));
});

export const create = asyncHandler(async (req, res) => {
  const data = await svc.create(req.body);
  res.status(201).json(new ApiResponse(201, data, 'Post created'));
});

export const update = asyncHandler(async (req, res) => {
  const data = await svc.update(req.params.id, req.body);
  res.json(new ApiResponse(200, data, 'Post updated'));
});

export const remove = asyncHandler(async (req, res) => {
  await svc.remove(req.params.id);
  res.json(new ApiResponse(200, null, 'Post deleted'));
});

export const uploadCover = asyncHandler(async (req, res) => {
  const data = await svc.uploadCover(req.params.id, req.file);
  res.json(new ApiResponse(200, data, 'Cover image uploaded'));
});
