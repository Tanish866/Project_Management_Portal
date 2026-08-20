const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const { ROLES } = require('../config/constants');
const { canAccessProject } = require('./projectController');
const { recalculateProjectProgress } = require('../services/progressService');

const isProjectManagerOwner = (project, user) => project.manager.toString() === user._id.toString();

/**
 * @desc  Create a task under a project
 * @route POST /api/projects/:projectId/tasks
 * @access Private/ProjectManager(owner) or Admin
 */
const createTask = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw ApiError.notFound('Project not found');

  if (req.user.role !== ROLES.ADMIN && !isProjectManagerOwner(project, req.user)) {
    throw ApiError.forbidden('Only the assigned Project Manager or an Admin can create tasks for this project');
  }

  const { title, description, assignedTo, priority, deadline } = req.body;

  if (assignedTo) {
    const isMember = project.teamMembers.some((m) => m.toString() === assignedTo);
    if (!isMember) {
      throw ApiError.badRequest('assignedTo must be a team member of this project');
    }
  }

  const task = await Task.create({
    title,
    description,
    project: project._id,
    assignedTo: assignedTo || null,
    priority,
    deadline,
    createdBy: req.user._id,
  });

  await recalculateProjectProgress(project._id);

  const populated = await task.populate('assignedTo', 'name email');
  sendResponse(res, 201, 'Task created successfully', { task: populated });
});

/**
 * @desc  Get all tasks for a project
 * @route GET /api/projects/:projectId/tasks
 * @access Private (must have access to the project)
 */
const getProjectTasks = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw ApiError.notFound('Project not found');

  if (!canAccessProject(req.user, project)) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  const filter = { project: project._id };

  // Team members only see tasks assigned to them within the project
  if (req.user.role === ROLES.TEAM_MEMBER) {
    filter.assignedTo = req.user._id;
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, 'Tasks retrieved successfully', { count: tasks.length, tasks });
});

/**
 * @desc  Get a single task by ID
 * @route GET /api/tasks/:id
 * @access Private (must have access via project or be assignee)
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name manager teamMembers');

  if (!task) throw ApiError.notFound('Task not found');

  if (!canAccessProject(req.user, task.project)) {
    throw ApiError.forbidden('You do not have access to this task');
  }

  if (
    req.user.role === ROLES.TEAM_MEMBER &&
    (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString())
  ) {
    throw ApiError.forbidden('You can only view tasks assigned to you');
  }

  sendResponse(res, 200, 'Task retrieved successfully', { task });
});

/**
 * @desc  Update a task (full update - PM/Admin only)
 * @route PUT /api/tasks/:id
 * @access Private/ProjectManager(owner) or Admin
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) throw ApiError.notFound('Task not found');

  const project = task.project;

  if (req.user.role !== ROLES.ADMIN && !isProjectManagerOwner(project, req.user)) {
    throw ApiError.forbidden('Only the assigned Project Manager or an Admin can update this task');
  }

  const { title, description, assignedTo, priority, deadline, status } = req.body;

  if (assignedTo !== undefined) {
    if (assignedTo) {
      const isMember = project.teamMembers.some((m) => m.toString() === assignedTo);
      if (!isMember) throw ApiError.badRequest('assignedTo must be a team member of this project');
    }
    task.assignedTo = assignedTo || null;
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (deadline !== undefined) task.deadline = deadline;
  if (status !== undefined) task.status = status;

  await task.save();
  await recalculateProjectProgress(project._id);

  const populated = await task.populate('assignedTo', 'name email');
  sendResponse(res, 200, 'Task updated successfully', { task: populated });
});

/**
 * @desc  Update only the status of a task.
 *        PM/Admin can update any task in their project.
 *        Team Member can only update tasks assigned to them.
 * @route PATCH /api/tasks/:id/status
 * @access Private
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) throw ApiError.notFound('Task not found');

  const project = task.project;
  const { status } = req.body;

  const isOwnerOrAdmin = req.user.role === ROLES.ADMIN || isProjectManagerOwner(project, req.user);
  const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (req.user.role === ROLES.TEAM_MEMBER && !isAssignee) {
    throw ApiError.forbidden('You can only update the status of tasks assigned to you');
  }

  if (req.user.role === ROLES.PROJECT_MANAGER && !isOwnerOrAdmin) {
    throw ApiError.forbidden('Only the assigned Project Manager or an Admin can update this task');
  }

  task.status = status;
  await task.save();
  await recalculateProjectProgress(project._id);

  sendResponse(res, 200, 'Task status updated successfully', { task });
});

/**
 * @desc  Delete a task
 * @route DELETE /api/tasks/:id
 * @access Private/ProjectManager(owner) or Admin
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) throw ApiError.notFound('Task not found');

  const project = task.project;

  if (req.user.role !== ROLES.ADMIN && !isProjectManagerOwner(project, req.user)) {
    throw ApiError.forbidden('Only the assigned Project Manager or an Admin can delete this task');
  }

  await Comment.deleteMany({ task: task._id });
  await task.deleteOne();
  await recalculateProjectProgress(project._id);

  sendResponse(res, 200, 'Task deleted successfully');
});

module.exports = {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
