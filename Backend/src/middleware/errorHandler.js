const ApiError = require('../utils/ApiError');

/**
 * Catches 404s for unmatched routes.
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Converts known Mongoose / JS errors into ApiError instances so the
 * final handler can respond consistently.
 */
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for '${err.path}': ${err.value}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest('Validation failed', errors);
  }

  // Duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`Duplicate value for field '${field}'`);
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Invalid JSON in request body');
  }

  // JWT errors that slipped through
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Invalid or expired token');
  }

  return ApiError.internal(err.message || 'Internal server error');
};

/**
 * Final centralized error handler. Must be registered last.
 */
const errorHandler = (err, req, res, next) => {
  const apiError = normalizeError(err);

  if (process.env.NODE_ENV !== 'test' && apiError.statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const body = {
    success: false,
    message: apiError.message,
  };

  if (apiError.errors && apiError.errors.length > 0) {
    body.errors = apiError.errors;
  }

  res.status(apiError.statusCode).json(body);
};

module.exports = { notFound, errorHandler };
