const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const commentRoutes = require('./commentRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
// taskRoutes internally defines /projects/:projectId/tasks and /tasks/:id
router.use('/', taskRoutes);
router.use('/', commentRoutes);
router.use('/', dashboardRoutes);

module.exports = router;
