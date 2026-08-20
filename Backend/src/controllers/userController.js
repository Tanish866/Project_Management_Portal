const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const User = require('../models/User');

/**
 * @desc  Get all users (supports optional ?role= filter)
 * @route GET /api/users
 * @access Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const users = await User.find(filter).sort({ createdAt: -1 });
  sendResponse(res, 200, 'Users retrieved successfully', { count: users.length, users });
});

/**
 * @desc  Get a single user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  sendResponse(res, 200, 'User retrieved successfully', { user });
});

/**
 * @desc  Create a new user (admin can set any role directly)
 * @route POST /api/users
 * @access Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw ApiError.conflict('A user with this email already exists');

  const user = await User.create({ name, email, password, role });
  sendResponse(res, 201, 'User created successfully', { user });
});

/**
 * @desc  Update a user's name/email
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw ApiError.conflict('A user with this email already exists');
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;

  await user.save();
  sendResponse(res, 200, 'User updated successfully', { user });
});

/**
 * @desc  Activate/deactivate a user
 * @route PATCH /api/users/:id/status
 * @access Private/Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (req.params.id === req.user._id.toString() && isActive === false) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isActive = isActive;
  await user.save();

  sendResponse(res, 200, `User ${isActive ? 'activated' : 'deactivated'} successfully`, { user });
});

/**
 * @desc  Change a user's role
 * @route PATCH /api/users/:id/role
 * @access Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.role = role;
  await user.save();

  sendResponse(res, 200, 'User role updated successfully', { user });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
};
