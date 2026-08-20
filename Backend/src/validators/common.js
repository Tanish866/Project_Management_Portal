const { param } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Validates that a route param is a valid MongoDB ObjectId.
 */
const mongoIdParam = (paramName) =>
  param(paramName).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`${paramName} must be a valid ID`);
    }
    return true;
  });

module.exports = { mongoIdParam };
