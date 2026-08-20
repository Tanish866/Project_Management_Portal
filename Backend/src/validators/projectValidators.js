const { body } = require('express-validator');
const { PROJECT_STATUS } = require('../config/constants');
const { mongoIdParam } = require('./common');

const createProjectValidator = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ min: 3, max: 150 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('status').optional().isIn(Object.values(PROJECT_STATUS)).withMessage('Invalid project status'),
];

const updateProjectValidator = [
  mongoIdParam('id'),
  body('name').optional().trim().isLength({ min: 3, max: 150 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('status').optional().isIn(Object.values(PROJECT_STATUS)).withMessage('Invalid project status'),
];

const projectIdValidator = [mongoIdParam('id')];

const addMemberValidator = [
  mongoIdParam('id'),
  body('userId').notEmpty().withMessage('userId is required'),
];

const removeMemberValidator = [mongoIdParam('id'), mongoIdParam('userId')];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
  addMemberValidator,
  removeMemberValidator,
};
