const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const { ROLES } = require('../config/constants');
const { canAccessProject } = require('./projectController');

/**
 * A user can access a task's comments if they can access the project AND
 * (they are PM/Admin, or they are the team member the task is assigned to).
 */
const canAccessTask = (user, task) => {
  if (!canAccessProject(user, task.project)) return false;

  if (user.role === ROLES.TEAM_MEMBER) {
    return task.assignedTo && task.assignedTo.toString() === user._id.toString();
  }

  return true;
};

/**
 * @desc  Add a comment to a task
 * @route POST /api/tasks/:taskId/comments
 * @access Private (must have access to the task)
 */
const createComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId).populate('project');
  if (!task) throw ApiError.notFound('Task not found');

  if (!canAccessTask(req.user, task)) {
    throw ApiError.forbidden('You do not have access to comment on this task');
  }

  const comment = await Comment.create({
    task: task._id,
    user: req.user._id,
    message: req.body.message,
  });

  const populated = await comment.populate('user', 'name email role');
  sendResponse(res, 201, 'Comment added successfully', { comment: populated });
});

/**
 * @desc  Get all comments for a task
 * @route GET /api/tasks/:taskId/comments
 * @access Private (must have access to the task)
 */
const getTaskComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId).populate('project');
  if (!task) throw ApiError.notFound('Task not found');

  if (!canAccessTask(req.user, task)) {
    throw ApiError.forbidden('You do not have access to view comments on this task');
  }

  const comments = await Comment.find({ task: task._id })
    .populate('user', 'name email role')
    .sort({ createdAt: 1 });

  sendResponse(res, 200, 'Comments retrieved successfully', { count: comments.length, comments });
});

/**
 * @desc  Update a comment. Only the comment author may edit it.
 * @route PUT /api/comments/:id
 * @access Private
 */
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('You can only edit your own comments');
  }

  comment.message = req.body.message;
  await comment.save();

  sendResponse(res, 200, 'Comment updated successfully', { comment });
});

/**
 * @desc  Delete a comment. Author, the project's PM, or an Admin may delete it.
 * @route DELETE /api/comments/:id
 * @access Private
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  const task = await Task.findById(comment.task).populate('project');
  const isAuthor = comment.user.toString() === req.user._id.toString();
  const isProjectManagerOwner =
    task && req.user.role === ROLES.PROJECT_MANAGER && task.project.manager.toString() === req.user._id.toString();

  if (!isAuthor && !isProjectManagerOwner && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('You do not have permission to delete this comment');
  }

  await comment.deleteOne();
  sendResponse(res, 200, 'Comment deleted successfully');
});

module.exports = { createComment, getTaskComments, updateComment, deleteComment };
