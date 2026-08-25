const crypto = require('crypto');
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

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * @desc  Request a password reset. Always responds with a generic success
 *        message regardless of whether the email exists, to avoid leaking
 *        which emails are registered. If the user exists, generates a reset
 *        token, stores its SHA-256 hash + expiry on the user, and (in
 *        non-production environments only) returns the plain token so it
 *        can be used without a real email service being wired up yet.
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const genericMessage = 'If an account with that email exists, a reset link has been sent.';

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return sendResponse(res, 200, genericMessage);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
  await user.save({ validateBeforeSave: false });

  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.log(`Would send password reset email to ${user.email} with token: ${resetToken}`);
    return sendResponse(res, 200, genericMessage);
  }

  // Non-production: return the plain token directly so the frontend/tests
  // can exercise the reset flow without a real email service.
  sendResponse(res, 200, genericMessage, { resetToken });
});

/**
 * @desc  Reset a user's password using a valid, non-expired reset token.
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendResponse(res, 200, 'Password has been reset successfully. You can now log in with your new password.');
});

/**
 * @desc  Change the logged-in user's password.
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendResponse(res, 200, 'Password changed successfully');
});

/**
 * @desc  Update the logged-in user's own name/email. Cannot change role
 *        (that remains an Admin-only action via PATCH /users/:id/role).
 * @route PUT /api/auth/me
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw ApiError.conflict('Email already in use');
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;

  await user.save();

  sendResponse(res, 200, 'Profile updated successfully', { user });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
};