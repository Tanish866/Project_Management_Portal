const express = require('express');
const {
  getUsers,
  getUserById,
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

router.use(protect, authorize(ROLES.ADMIN));

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
router.get('/', getUsers);
router.post('/', createUserValidator, validate, createUser);

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
router.get('/:id', getUserValidator, validate, getUserById);
router.put('/:id', updateUserValidator, validate, updateUser);

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
router.patch('/:id/status', updateStatusValidator, validate, updateUserStatus);

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
router.patch('/:id/role', updateRoleValidator, validate, updateUserRole);

module.exports = router;
