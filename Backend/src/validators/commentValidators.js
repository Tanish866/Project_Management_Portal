const { body } = require('express-validator');
const { mongoIdParam } = require('./common');

const createCommentValidator = [
  mongoIdParam('taskId'),
  body('message').trim().notEmpty().withMessage('Comment message is required').isLength({ max: 1000 }),
];

const updateCommentValidator = [
  mongoIdParam('id'),
  body('message').trim().notEmpty().withMessage('Comment message is required').isLength({ max: 1000 }),
];

const commentIdValidator = [mongoIdParam('id')];
const taskIdValidator = [mongoIdParam('taskId')];

module.exports = {
  createCommentValidator,
  updateCommentValidator,
  commentIdValidator,
  taskIdValidator,
};
