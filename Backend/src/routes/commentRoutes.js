const express = require('express');
const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createCommentValidator,
  updateCommentValidator,
  commentIdValidator,
  taskIdValidator,
} = require('../validators/commentValidators');

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /api/tasks/{taskId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Add a comment to a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       201: { description: Comment added successfully }
 *   get:
 *     tags: [Comments]
 *     summary: List comments on a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Comments retrieved successfully }
 */
router.post('/tasks/:taskId/comments', createCommentValidator, validate, createComment);
router.get('/tasks/:taskId/comments', taskIdValidator, validate, getTaskComments);

/**
 * @openapi
 * /api/comments/{id}:
 *   put:
 *     tags: [Comments]
 *     summary: Update a comment (author only)
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
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200: { description: Comment updated successfully }
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment (author, owning PM, or Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Comment deleted successfully }
 */
router.put('/comments/:id', updateCommentValidator, validate, updateComment);
router.delete('/comments/:id', commentIdValidator, validate, deleteComment);

module.exports = router;
