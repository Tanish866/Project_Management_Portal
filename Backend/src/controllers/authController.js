const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

/**
 * @desc  Register a new user (always as TEAM_MEMBER, regardless of body.role)
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('A user with this email already exists');
  }

  // Public registration can never grant ADMIN or PROJECT_MANAGER roles.
  // Only an existing Admin can promote a user via PATCH /api/users/:id/role
  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.TEAM_MEMBER,
  });

  const token = generateToken(user);

  sendResponse(res, 201, 'User registered successfully', { user, token });
});

/**
 * @desc  Login a user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('This account has been deactivated. Contact an administrator');
  }

  const token = generateToken(user);
  user.password = undefined;

  sendResponse(res, 200, 'Login successful', { user, token });
});

/**
 * @desc  Get the currently logged-in user
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, 'Current user retrieved successfully', { user: req.user });
});

/**
 * @desc  Logout. Since JWTs are stateless, logout is handled client-side by
 *        discarding the token. This endpoint exists for API completeness
 *        and confirms the action to the client.
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {
  sendResponse(res, 200, 'Logged out successfully. Please discard your token on the client.');
});

module.exports = { register, login, getMe, logout };
