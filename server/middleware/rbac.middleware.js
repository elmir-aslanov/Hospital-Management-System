import ApiError from '../utils/ApiError.js';

const authorize = (...roles) =>
  (req, _res, next) => {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Forbidden: insufficient permissions`);
    }
    next();
  };

export default authorize;
