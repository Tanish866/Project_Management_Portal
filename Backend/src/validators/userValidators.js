const { body } = require('express-validator');
const { ROLES } = require('../config/constants');
const { mongoIdParam } = require('./common');

const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of ${Object.values(ROLES).join(', ')}`),
];

const updateUserValidator = [
  mongoIdParam('id'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().trim().isEmail().withMessage('Invalid email address'),
];

const updateRoleValidator = [
  mongoIdParam('id'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of ${Object.values(ROLES).join(', ')}`),
];

const updateStatusValidator = [
  mongoIdParam('id'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
];

const getUserValidator = [mongoIdParam('id')];

module.exports = {
  createUserValidator,
  updateUserValidator,
  updateRoleValidator,
  updateStatusValidator,
  getUserValidator,
};
