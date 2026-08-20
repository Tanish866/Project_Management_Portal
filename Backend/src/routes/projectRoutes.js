const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  getMembers,
  removeMember,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');
const {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
  addMemberValidator,
  removeMemberValidator,
} = require('../validators/projectValidators');

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project (Project Manager only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, startDate]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               status: { type: string, enum: [NOT_STARTED, IN_PROGRESS, ON_HOLD, COMPLETED] }
 *     responses:
 *       201: { description: Project created successfully }
 *   get:
 *     tags: [Projects]
 *     summary: List projects visible to the current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Projects retrieved successfully }
 */
router.post('/', authorize(ROLES.PROJECT_MANAGER), createProjectValidator, validate, createProject);
router.get('/', getProjects);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project retrieved successfully }
 *       403: { description: Forbidden }
 *       404: { description: Project not found }
 *   put:
 *     tags: [Projects]
 *     summary: Update a project (owning PM or Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project updated successfully }
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project (owning PM or Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project deleted successfully }
 */
router.get('/:id', projectIdValidator, validate, getProjectById);
router.put(
  '/:id',
  authorize(ROLES.PROJECT_MANAGER, ROLES.ADMIN),
  updateProjectValidator,
  validate,
  updateProject
);
router.delete('/:id', authorize(ROLES.PROJECT_MANAGER, ROLES.ADMIN), projectIdValidator, validate, deleteProject);

/**
 * @openapi
 * /api/projects/{id}/members:
 *   post:
 *     tags: [Team]
 *     summary: Add a team member to a project
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
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200: { description: Team member added successfully }
 *   get:
 *     tags: [Team]
 *     summary: List a project's team members
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Team members retrieved successfully }
 */
router.post(
  '/:id/members',
  authorize(ROLES.PROJECT_MANAGER, ROLES.ADMIN),
  addMemberValidator,
  validate,
  addMember
);
router.get('/:id/members', projectIdValidator, validate, getMembers);

/**
 * @openapi
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     tags: [Team]
 *     summary: Remove a team member from a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Team member removed successfully }
 */
router.delete(
  '/:id/members/:userId',
  authorize(ROLES.PROJECT_MANAGER, ROLES.ADMIN),
  removeMemberValidator,
  validate,
  removeMember
);

module.exports = router;
