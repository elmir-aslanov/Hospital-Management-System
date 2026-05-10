import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Run after express-validator chains.
 * Collects all validation errors and throws a single 422 ApiError.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new ApiError(422, 'Validation failed', extracted);
  }
  next();
};

export default validate;
