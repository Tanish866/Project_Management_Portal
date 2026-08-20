const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const { ROLES } = require('../config/constants');

/**
 * Returns true if the requesting user is allowed to view/manage this project.
 */
const canAccessProject = (user, project) => {
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.PROJECT_MANAGER) {
    return project.manager._id
      ? project.manager._id.toString() === user._id.toString()
      : project.manager.toString() === user._id.toString();
  }
  // TEAM_MEMBER
  return project.teamMembers.some((m) => (m._id ? m._id.toString() : m.toString()) === user._id.toString());
};

/**
 * @desc  Create a new project. The creating Project Manager is set as the manager.
 * @route POST /api/projects
 * @access Private/ProjectManager
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, description, startDate, endDate, status } = req.body;

  const project = await Project.create({
    name,
    description,
    startDate,
    endDate,
    status,
    manager: req.user._id,
    teamMembers: [],
  });

  sendResponse(res, 201, 'Project created successfully', { project });
});

/**
 * @desc  List projects visible to the requesting user.
 *        Admin -> all projects. PM -> only projects they manage.
 *        Team Member -> only projects they belong to.
 * @route GET /api/projects
 * @access Private
 */
const getProjects = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === ROLES.PROJECT_MANAGER) {
    filter = { manager: req.user._id };
  } else if (req.user.role === ROLES.TEAM_MEMBER) {
    filter = { teamMembers: req.user._id };
  }
  // ADMIN -> no filter, sees everything

  const projects = await Project.find(filter)
    .populate('manager', 'name email role')
    .populate('teamMembers', 'name email role')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, 'Projects retrieved successfully', { count: projects.length, projects });
});

/**
 * @desc  Get a single project by ID
 * @route GET /api/projects/:id
 * @access Private
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('manager', 'name email role')
    .populate('teamMembers', 'name email role');

  if (!project) throw ApiError.notFound('Project not found');

  if (!canAccessProject(req.user, project)) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  sendResponse(res, 200, 'Project retrieved successfully', { project });
});

/**
 * @desc  Update a project. Only the managing PM or an Admin may update it.
 * @route PUT /api/projects/:id
 * @access Private/ProjectManager(owner) or Admin
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  const isOwner = project.manager.toString() === req.user._id.toString();
  if (req.user.role !== ROLES.ADMIN && !isOwner) {
    throw ApiError.forbidden('Only the assigned Project Manager or an Admin can update this project');
  }

  const fields = ['name', 'description', 'startDate', 'endDate', 'status', 'progress'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  });

  await project.save();
  sendResponse(res, 200, 'Project updated successfully', { project });
});

/**
 * @desc  Delete a project (and its tasks/comments)
 * @route DELETE /api/projects/:id
 * @access Private/ProjectManager(owner) or Admin
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  const isOwner = project.manager.toString() === req.user._id.toString();
  if (req.user.role !== ROLES.ADMIN && !isOwner) {
    throw ApiError.forbidden('Only the assigned Project Manager or an Admin can delete this project');
  }

  const tasks = await Task.find({ project: project._id }).select('_id');
  const taskIds = tasks.map((t) => t._id);

  await Comment.deleteMany({ task: { $in: taskIds } });
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  sendResponse(res, 200, 'Project deleted successfully');
});

/**
 * @desc  Add a team member to a project
 * @route POST /api/projects/:id/members
 * @access Private/ProjectManager(owner) or Admin
 */
const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  const isOwner = project.manager.toString() === req.user._id.toString();
  if (req.user.role !== ROLES.ADMIN && !isOwner) {
    throw ApiError.forbidden('Only the assigned Project Manager or an Admin can manage team members');
  }

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role !== ROLES.TEAM_MEMBER) {
    throw ApiError.badRequest('Only users with the TEAM_MEMBER role can be added as team members');
  }

  const alreadyMember = project.teamMembers.some((m) => m.toString() === userId);
  if (alreadyMember) throw ApiError.conflict('This user is already a member of the project');

  project.teamMembers.push(userId);
  await project.save();

  const populated = await project.populate('teamMembers', 'name email role');
  sendResponse(res, 200, 'Team member added successfully', { project: populated });
});

/**
 * @desc  View team members of a project
 * @route GET /api/projects/:id/members
 * @access Private (must have access to project)
 */
const getMembers = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('teamMembers', 'name email role isActive');
  if (!project) throw ApiError.notFound('Project not found');

  if (!canAccessProject(req.user, project)) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  sendResponse(res, 200, 'Team members retrieved successfully', {
    count: project.teamMembers.length,
    members: project.teamMembers,
  });
});

/**
 * @desc  Remove a team member from a project
 * @route DELETE /api/projects/:id/members/:userId
 * @access Private/ProjectManager(owner) or Admin
 */
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  const isOwner = project.manager.toString() === req.user._id.toString();
  if (req.user.role !== ROLES.ADMIN && !isOwner) {
    throw ApiError.forbidden('Only the assigned Project Manager or an Admin can manage team members');
  }

  const { userId } = req.params;
  const wasMember = project.teamMembers.some((m) => m.toString() === userId);
  if (!wasMember) throw ApiError.notFound('This user is not a member of the project');

  project.teamMembers = project.teamMembers.filter((m) => m.toString() !== userId);
  await project.save();

  // Unassign any tasks in this project that were assigned to the removed member
  await Task.updateMany(
    { project: project._id, assignedTo: userId },
    { $set: { assignedTo: null } }
  );

  sendResponse(res, 200, 'Team member removed successfully', { project });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  getMembers,
  removeMember,
  canAccessProject,
};
