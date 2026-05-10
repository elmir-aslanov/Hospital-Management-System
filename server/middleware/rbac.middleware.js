import ApiError from '../utils/ApiError.js';

/**
 * Role-based access control factory.
 * Usage: router.get('/route', authenticate, authorize('ADMIN', 'DOCTOR'), handler)
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) =>
  (req, _res, next) => {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not allowed to access this resource`);
    }

    next();
  };

export default authorize;
