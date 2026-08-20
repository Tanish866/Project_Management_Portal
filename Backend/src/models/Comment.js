const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'A comment must belong to a task'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A comment must have an author'],
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

commentSchema.index({ task: 1 });

module.exports = mongoose.model('Comment', commentSchema);
