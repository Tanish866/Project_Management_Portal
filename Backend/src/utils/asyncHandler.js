/**
 * Wraps an async express route/controller function and forwards any
 * rejected promise to the centralized error handler via next().
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
