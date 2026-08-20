const Task = require('../models/Task');
const Project = require('../models/Project');
const { TASK_STATUS, PROJECT_STATUS } = require('../config/constants');

/**
 * Recalculates and persists a project's progress percentage based on the
 * ratio of COMPLETED tasks to total tasks belonging to that project.
 * Also nudges the project status forward when appropriate:
 *  - 0 tasks completed and project still NOT_STARTED -> leave as is
 *  - some progress made -> IN_PROGRESS (unless already ON_HOLD/COMPLETED)
 *  - 100% -> COMPLETED
 */
const recalculateProjectProgress = async (projectId) => {
  const totalTasks = await Task.countDocuments({ project: projectId });
  const completedTasks = await Task.countDocuments({
    project: projectId,
    status: TASK_STATUS.COMPLETED,
  });

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const project = await Project.findById(projectId);
  if (!project) return null;

  project.progress = progress;

  if (project.status !== PROJECT_STATUS.ON_HOLD) {
    if (progress === 100 && totalTasks > 0) {
      project.status = PROJECT_STATUS.COMPLETED;
    } else if (progress > 0 && project.status === PROJECT_STATUS.NOT_STARTED) {
      project.status = PROJECT_STATUS.IN_PROGRESS;
    } else if (progress < 100 && project.status === PROJECT_STATUS.COMPLETED) {
      project.status = PROJECT_STATUS.IN_PROGRESS;
    }
  }

  await project.save();
  return project;
};

module.exports = { recalculateProjectProgress };
