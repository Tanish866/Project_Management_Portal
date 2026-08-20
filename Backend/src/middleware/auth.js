const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the JWT sent in the Authorization header (Bearer token),
 * loads the corresponding user and attaches it to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authenticated. Please provide a valid token');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw ApiError.unauthorized('User belonging to this token no longer exists');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('This account has been deactivated');
  }

  req.user = user;
  next();
});

/**
 * Restricts access to the given list of roles.
 * Usage: authorize('ADMIN', 'PROJECT_MANAGER')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden(
      `Role '${req.user.role}' is not authorized to perform this action`
    );
  }

  next();
};

module.exports = { protect, authorize };
