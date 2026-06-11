import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import * as svc     from './blogPosts.service.js';
import { BLOG_CATEGORIES } from '../../config/blogCategories.js';

export const getAll = asyncHandler(async (req, res) => {
  const { page, limit, category, search } = req.query;
  const data = await svc.getAll({ page, limit, category, search });
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(new ApiResponse(200, data));
});

export const getCategories = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, BLOG_CATEGORIES));
});

export const getAdminAll = asyncHandler(async (req, res) => {
  const { page, limit, category, search, status } = req.query;
  const data = await svc.getAdminAll({ page, limit, category, search, status });
  res.json(new ApiResponse(200, data));
});

export const getOne = asyncHandler(async (req, res) => {
  const data = await svc.getOne(req.params.slug);
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
