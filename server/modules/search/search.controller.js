import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { searchPatients } from '../patients/patients.service.js';

// GET /api/v1/search/patients?query=&condition=&page=&limit=
export const searchPatientsHandler = asyncHandler(async (req, res) => {
  const { query, condition, page, limit } = req.query;
  const result = await searchPatients({ query, condition, page, limit });
  res.status(200).json(new ApiResponse(200, result));
});
