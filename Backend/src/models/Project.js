const mongoose = require('mongoose');
const { PROJECT_STATUS } = require('../config/constants');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [3, 'Project name must be at least 3 characters long'],
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function validateEndDate(value) {
          if (!value) return true;
          return value >= this.startDate;
        },
        message: 'End date cannot be before start date',
      },
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A project must have a manager'],
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: {
        values: Object.values(PROJECT_STATUS),
        message: 'Invalid project status',
      },
      default: PROJECT_STATUS.NOT_STARTED,
    },
    progress: {
      type: Number,
      min: [0, 'Progress cannot be less than 0'],
      max: [100, 'Progress cannot be more than 100'],
      default: 0,
    },
  },
  { timestamps: true }
);

projectSchema.index({ manager: 1 });
projectSchema.index({ teamMembers: 1 });

module.exports = mongoose.model('Project', projectSchema);
