const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/ApiResponse');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { ROLES, PROJECT_STATUS, TASK_STATUS } = require('../config/constants');

/**
 * @desc  Admin dashboard - system-wide statistics
 * @route GET /api/admin/dashboard
 * @access Private/Admin
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, activeTeamMembers, totalProjects, activeProjects, completedProjects] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: ROLES.TEAM_MEMBER, isActive: true }),
    Project.countDocuments(),
    Project.countDocuments({ status: PROJECT_STATUS.IN_PROGRESS }),
    Project.countDocuments({ status: PROJECT_STATUS.COMPLETED }),
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  sendResponse(res, 200, 'Admin dashboard retrieved successfully', {
    totalUsers,
    activeTeamMembers,
    totalProjects,
    activeProjects,
    completedProjects,
    usersByRole: usersByRole.map((r) => ({ role: r._id, count: r.count })),
  });
});

/**
 * @desc  Project Manager dashboard - stats scoped to their own projects
 * @route GET /api/manager/dashboard
 * @access Private/ProjectManager
 */
const getManagerDashboard = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  const projects = await Project.find({ manager: managerId });
  const projectIds = projects.map((p) => p._id);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === PROJECT_STATUS.IN_PROGRESS).length;

  const [tasksInProgress, pendingTasks, teamMembersSet] = await Promise.all([
    Task.countDocuments({ project: { $in: projectIds }, status: TASK_STATUS.IN_PROGRESS }),
    Task.countDocuments({ project: { $in: projectIds }, status: TASK_STATUS.TODO }),
    Project.aggregate([
      { $match: { manager: new mongoose.Types.ObjectId(managerId) } },
      { $unwind: { path: '$teamMembers', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$teamMembers' } },
    ]),
  ]);

  const upcomingDeadlines = await Task.find({
    project: { $in: projectIds },
    status: { $ne: TASK_STATUS.COMPLETED },
    deadline: { $gte: new Date() },
  })
    .sort({ deadline: 1 })
    .limit(5)
    .populate('assignedTo', 'name email')
    .populate('project', 'name');

  const teamMemberCount = teamMembersSet.filter((t) => t._id).length;

  sendResponse(res, 200, 'Project Manager dashboard retrieved successfully', {
    totalProjects,
    activeProjects,
    tasksInProgress,
    pendingTasks,
    teamMembers: teamMemberCount,
    projects: projects.map((p) => ({
      id: p._id,
      name: p.name,
      status: p.status,
      progress: p.progress,
    })),
    upcomingDeadlines,
  });
});

/**
 * @desc  Team Member dashboard - stats scoped to tasks/projects assigned to them
 * @route GET /api/member/dashboard
 * @access Private/TeamMember
 */
const getMemberDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const assignedProjects = await Project.find({ teamMembers: userId }).select('name status progress');

  const [pendingTasks, tasksInProgress, completedTasks] = await Promise.all([
    Task.countDocuments({ assignedTo: userId, status: TASK_STATUS.TODO }),
    Task.countDocuments({ assignedTo: userId, status: TASK_STATUS.IN_PROGRESS }),
    Task.countDocuments({ assignedTo: userId, status: TASK_STATUS.COMPLETED }),
  ]);

  const upcomingDeadlines = await Task.find({
    assignedTo: userId,
    status: { $ne: TASK_STATUS.COMPLETED },
    deadline: { $gte: new Date() },
  })
    .sort({ deadline: 1 })
    .limit(5)
    .populate('project', 'name');

  sendResponse(res, 200, 'Team Member dashboard retrieved successfully', {
    assignedProjects,
    pendingTasks,
    tasksInProgress,
    completedTasks,
    upcomingDeadlines,
  });
});

module.exports = { getAdminDashboard, getManagerDashboard, getMemberDashboard };