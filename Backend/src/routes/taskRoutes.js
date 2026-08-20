const express = require('express');
const {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');
const {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
  taskIdValidator,
  projectIdValidator,
} = require('../validators/taskValidators');

// mergeParams so nested router can read :projectId from the parent mount
const router = express.Router({ mergeParams: true });

router.use(protect);

/**
 * @openapi
 * /api/projects/{projectId}/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task under a project (owning PM or Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, deadline]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               assignedTo: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               deadline: { type: string, format: date }
 *     responses:
 *       201: { description: Task created successfully }
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks for a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Tasks retrieved successfully }
 */
router.post(
  '/projects/:projectId/tasks',
  authorize(ROLES.PROJECT_MANAGER, ROLES.ADMIN),
  createTaskValidator,
  validate,
  createTask
);
router.get('/projects/:projectId/tasks', projectIdValidator, validate, getProjectTasks);

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task retrieved successfully }
 *   put:
 *     tags: [Tasks]
 *     summary: Fully update a task (owning PM or Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task updated successfully }
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task (owning PM or Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task deleted successfully }
 */
router.get('/tasks/:id', taskIdValidator, validate, getTaskById);
router.put('/tasks/:id', authorize(ROLES.PROJECT_MANAGER, ROLES.ADMIN), updateTaskValidator, validate, updateTask);
router.delete('/tasks/:id', authorize(ROLES.PROJECT_MANAGER, ROLES.ADMIN), taskIdValidator, validate, deleteTask);

/**
 * @openapi
 * /api/tasks/{id}/status:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task's status (assignee, owning PM, or Admin)
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [TODO, IN_PROGRESS, COMPLETED] }
 *     responses:
 *       200: { description: Task status updated successfully }
 */
router.patch('/tasks/:id/status', updateTaskStatusValidator, validate, updateTaskStatus);

module.exports = router;
