import asyncHandler  from '../../utils/asyncHandler.js';
import ApiResponse   from '../../utils/ApiResponse.js';
import * as searchService from './search.service.js';

export const searchPatients = asyncHandler(async (req, res) => {
  const { query, condition, page, limit } = req.query;
  const result = await searchService.searchPatients({ query, condition, page, limit });
  res.status(200).json(new ApiResponse(200, result));
});

export const search = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;
  const results = await searchService.globalSearch(q, limit);
  res.json(new ApiResponse(200, results));
});
