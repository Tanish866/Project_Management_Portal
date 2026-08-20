const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY } = require('../config/constants');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'A task must belong to a project'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TASK_PRIORITY),
        message: 'Invalid task priority',
      },
      default: TASK_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TASK_STATUS),
        message: 'Invalid task status',
      },
      default: TASK_STATUS.TODO,
    },
    deadline: {
      type: Date,
      required: [true, 'Task deadline is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Task', taskSchema);
