/**
 * Seed script - populates the database with sample data for development/testing.
 *
 * Usage:
 *   npm run seed
 *
 * WARNING: This clears existing Users, Projects, Tasks and Comments collections
 * before inserting fresh sample data. Do NOT run against a production database.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const Comment = require('../src/models/Comment');
const { ROLES, PROJECT_STATUS, TASK_STATUS, TASK_PRIORITY } = require('../src/config/constants');

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  console.log('Creating users...');

  const admin = await User.create({
    name: 'Alice Admin',
    email: 'admin@ppm.test',
    password: 'Admin@123',
    role: ROLES.ADMIN,
  });

  const manager1 = await User.create({
    name: 'Mona Manager',
    email: 'manager1@ppm.test',
    password: 'Manager@123',
    role: ROLES.PROJECT_MANAGER,
  });

  const manager2 = await User.create({
    name: 'Mark Manager',
    email: 'manager2@ppm.test',
    password: 'Manager@123',
    role: ROLES.PROJECT_MANAGER,
  });

  const member1 = await User.create({
    name: 'Tina Team',
    email: 'member1@ppm.test',
    password: 'Member@123',
    role: ROLES.TEAM_MEMBER,
  });

  const member2 = await User.create({
    name: 'Tom Team',
    email: 'member2@ppm.test',
    password: 'Member@123',
    role: ROLES.TEAM_MEMBER,
  });

  const member3 = await User.create({
    name: 'Tara Team',
    email: 'member3@ppm.test',
    password: 'Member@123',
    role: ROLES.TEAM_MEMBER,
  });

  const member4 = await User.create({
    name: 'Theo Team',
    email: 'member4@ppm.test',
    password: 'Member@123',
    role: ROLES.TEAM_MEMBER,
  });

  console.log('Creating projects...');

  const project1 = await Project.create({
    name: 'College Portal Revamp',
    description: 'Redesign and rebuild the student portal backend and APIs.',
    startDate: daysFromNow(-20),
    endDate: daysFromNow(40),
    manager: manager1._id,
    teamMembers: [member1._id, member2._id],
    status: PROJECT_STATUS.IN_PROGRESS,
  });

  const project2 = await Project.create({
    name: 'Library Management System',
    description: 'Backend for managing books, members and issue/return records.',
    startDate: daysFromNow(-10),
    endDate: daysFromNow(60),
    manager: manager1._id,
    teamMembers: [member2._id, member3._id],
    status: PROJECT_STATUS.NOT_STARTED,
  });

  const project3 = await Project.create({
    name: 'Alumni Networking Platform',
    description: 'A platform for alumni to connect, mentor and post job openings.',
    startDate: daysFromNow(-30),
    endDate: daysFromNow(10),
    manager: manager2._id,
    teamMembers: [member3._id, member4._id],
    status: PROJECT_STATUS.IN_PROGRESS,
  });

  console.log('Creating tasks...');

  const tasksData = [
    {
      title: 'Design database schema',
      description: 'Design ER diagram and Mongoose schemas for the portal.',
      project: project1._id,
      assignedTo: member1._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.COMPLETED,
      deadline: daysFromNow(-5),
      createdBy: manager1._id,
    },
    {
      title: 'Implement authentication APIs',
      description: 'JWT based login/register endpoints.',
      project: project1._id,
      assignedTo: member1._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      deadline: daysFromNow(5),
      createdBy: manager1._id,
    },
    {
      title: 'Build student profile module',
      description: 'CRUD APIs for student profile management.',
      project: project1._id,
      assignedTo: member2._id,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      deadline: daysFromNow(12),
      createdBy: manager1._id,
    },
    {
      title: 'Set up project repository',
      description: 'Initialize repo, CI config and base folder structure.',
      project: project2._id,
      assignedTo: member2._id,
      priority: TASK_PRIORITY.LOW,
      status: TASK_STATUS.TODO,
      deadline: daysFromNow(3),
      createdBy: manager1._id,
    },
    {
      title: 'Design book catalog schema',
      description: 'Model books, authors and categories.',
      project: project2._id,
      assignedTo: member3._id,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      deadline: daysFromNow(15),
      createdBy: manager1._id,
    },
    {
      title: 'Build mentor-matching algorithm',
      description: 'Match alumni mentors with students based on interests.',
      project: project3._id,
      assignedTo: member3._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      deadline: daysFromNow(7),
      createdBy: manager2._id,
    },
    {
      title: 'Create job posting APIs',
      description: 'Allow alumni to post and manage job openings.',
      project: project3._id,
      assignedTo: member4._id,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.COMPLETED,
      deadline: daysFromNow(-2),
      createdBy: manager2._id,
    },
    {
      title: 'Write API documentation',
      description: 'Document all endpoints using Swagger.',
      project: project3._id,
      assignedTo: member4._id,
      priority: TASK_PRIORITY.LOW,
      status: TASK_STATUS.TODO,
      deadline: daysFromNow(20),
      createdBy: manager2._id,
    },
  ];

  const tasks = await Task.insertMany(tasksData);

  console.log('Creating comments...');

  await Comment.insertMany([
    {
      task: tasks[0]._id,
      user: member1._id,
      message: 'Schema draft is ready for review.',
    },
    {
      task: tasks[0]._id,
      user: manager1._id,
      message: 'Looks good, approved. Great work!',
    },
    {
      task: tasks[1]._id,
      user: member1._id,
      message: 'Login endpoint is done, working on refresh flow next.',
    },
    {
      task: tasks[5]._id,
      user: member3._id,
      message: 'Initial matching logic implemented, testing edge cases now.',
    },
    {
      task: tasks[6]._id,
      user: manager2._id,
      message: 'Nice work, this is ready to be merged.',
    },
  ]);

  // Recalculate progress for each project based on seeded tasks
  const { recalculateProjectProgress } = require('../src/services/progressService');
  await recalculateProjectProgress(project1._id);
  await recalculateProjectProgress(project2._id);
  await recalculateProjectProgress(project3._id);

  console.log('\nSeed data created successfully!\n');
  console.log('Sample credentials (development/testing only):');
  console.log('----------------------------------------------');
  console.log('Admin:            admin@ppm.test / Admin@123');
  console.log('Project Manager:  manager1@ppm.test / Manager@123');
  console.log('Project Manager:  manager2@ppm.test / Manager@123');
  console.log('Team Member:      member1@ppm.test / Member@123');
  console.log('Team Member:      member2@ppm.test / Member@123');
  console.log('Team Member:      member3@ppm.test / Member@123');
  console.log('Team Member:      member4@ppm.test / Member@123');
  console.log('----------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('Seeding failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
