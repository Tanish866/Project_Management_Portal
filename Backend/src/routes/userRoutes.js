const express = require('express');
const {
  getUsers,
  getUserById,
  getEligibleMembers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');
const {
  createUserValidator,
  updateUserValidator,
  updateRoleValidator,
  updateStatusValidator,
  getUserValidator,
} = require('../validators/userValidators');

const router = express.Router();

// Only authentication is enforced here; each route below sets its own
// allowed roles via authorize(...), since not all /users routes are
// admin-only (see GET /eligible-members).
router.use(protect);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *     responses:
 *       200: { description: Users retrieved successfully }
 *       403: { description: Forbidden }
 *   post:
 *     tags: [Users]
 *     summary: Create a user with any role (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [ADMIN, PROJECT_MANAGER, TEAM_MEMBER] }
 *     responses:
 *       201: { description: User created successfully }
 */
router.get('/', authorize(ROLES.ADMIN), getUsers);
router.post('/', authorize(ROLES.ADMIN), createUserValidator, validate, createUser);

/**
 * @openapi
 * /api/users/eligible-members:
 *   get:
 *     tags: [Users]
 *     summary: Get users with the TEAM_MEMBER role (Admin or Project Manager only)
 *     description: >
 *       Used by Project Managers (and Admins) to find candidate users when
 *       adding team members to a project. Only returns _id, name and email.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive partial match against name or email
 *     responses:
 *       200: { description: Eligible team members retrieved successfully }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden }
 */
router.get('/eligible-members', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), getEligibleMembers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User retrieved successfully }
 *       404: { description: User not found }
 *   put:
 *     tags: [Users]
 *     summary: Update a user's name/email (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User updated successfully }
 */
router.get('/:id', authorize(ROLES.ADMIN), getUserValidator, validate, getUserById);
router.put('/:id', authorize(ROLES.ADMIN), updateUserValidator, validate, updateUser);

/**
 * @openapi
 * /api/users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Activate or deactivate a user (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: User status updated successfully }
 */
router.patch('/:id/status', authorize(ROLES.ADMIN), updateStatusValidator, validate, updateUserStatus);

/**
 * @openapi
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Change a user's role (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [ADMIN, PROJECT_MANAGER, TEAM_MEMBER] }
 *     responses:
 *       200: { description: User role updated successfully }
 */
router.patch('/:id/role', authorize(ROLES.ADMIN), updateRoleValidator, validate, updateUserRole);

module.exports = router;