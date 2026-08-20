const { body } = require('express-validator');
const { TASK_STATUS, TASK_PRIORITY } = require('../config/constants');
const { mongoIdParam } = require('./common');

const createTaskValidator = [
  mongoIdParam('projectId'),
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ min: 3, max: 150 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('assignedTo').optional().isMongoId().withMessage('assignedTo must be a valid user ID'),
  body('priority').optional().isIn(Object.values(TASK_PRIORITY)).withMessage('Invalid task priority'),
  body('deadline').notEmpty().withMessage('Deadline is required').isISO8601().withMessage('Invalid deadline date'),
];

const updateTaskValidator = [
  mongoIdParam('id'),
  body('title').optional().trim().isLength({ min: 3, max: 150 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('assignedTo').optional().isMongoId().withMessage('assignedTo must be a valid user ID'),
  body('priority').optional().isIn(Object.values(TASK_PRIORITY)).withMessage('Invalid task priority'),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline date'),
  body('status').optional().isIn(Object.values(TASK_STATUS)).withMessage('Invalid task status'),
];

const updateTaskStatusValidator = [
  mongoIdParam('id'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(TASK_STATUS))
    .withMessage('Invalid task status'),
];

const taskIdValidator = [mongoIdParam('id')];
const projectIdValidator = [mongoIdParam('projectId')];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
  taskIdValidator,
  projectIdValidator,
};
