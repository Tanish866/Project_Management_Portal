const express = require('express');
const {
  getAdminDashboard,
  getManagerDashboard,
  getMemberDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Admin dashboard statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin dashboard retrieved successfully }
 */
router.get('/admin/dashboard', authorize(ROLES.ADMIN), getAdminDashboard);

/**
 * @openapi
 * /api/manager/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Project Manager dashboard statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Project Manager dashboard retrieved successfully }
 */
router.get('/manager/dashboard', authorize(ROLES.PROJECT_MANAGER), getManagerDashboard);

/**
 * @openapi
 * /api/member/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Team Member dashboard statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Team Member dashboard retrieved successfully }
 */
router.get('/member/dashboard', authorize(ROLES.TEAM_MEMBER), getMemberDashboard);

module.exports = router;
