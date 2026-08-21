const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const { createUser, authHeader, ROLES } = require('./testHelpers');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

beforeAll(async () => connectTestDB());
afterEach(async () => clearTestDB());
afterAll(async () => closeTestDB());

describe('Dashboard API', () => {
  describe('GET /api/admin/dashboard', () => {
    it('returns system-wide stats for an admin', async () => {
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });
      const { user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      await createUser({ role: ROLES.TEAM_MEMBER });

      await Project.create({ name: 'Project One', startDate: new Date(), manager: pm._id });

      const res = await request(app).get('/api/admin/dashboard').set('Authorization', authHeader(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(3);
      expect(res.body.data.totalProjects).toBeGreaterThanOrEqual(1);
    });

    it('forbids a non-admin from accessing the admin dashboard', async () => {
      const { token } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const res = await request(app).get('/api/admin/dashboard').set('Authorization', authHeader(token));
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/manager/dashboard', () => {
    it('returns stats scoped to the requesting PM', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });

      const project = await Project.create({
        name: 'PM Project',
        startDate: new Date(),
        manager: pm._id,
        teamMembers: [member._id],
      });

      await Task.create({
        title: 'Task A',
        project: project._id,
        assignedTo: member._id,
        deadline: new Date(Date.now() + 86400000),
        createdBy: pm._id,
        status: 'IN_PROGRESS',
      });

      const res = await request(app).get('/api/manager/dashboard').set('Authorization', authHeader(pmToken));

      expect(res.status).toBe(200);
      expect(res.body.data.totalProjects).toBe(1);
      expect(res.body.data.tasksInProgress).toBe(1);
    });

    it('forbids a team member from accessing the manager dashboard', async () => {
      const { token } = await createUser({ role: ROLES.TEAM_MEMBER });
      const res = await request(app).get('/api/manager/dashboard').set('Authorization', authHeader(token));
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/member/dashboard', () => {
    it('returns stats scoped to the requesting team member', async () => {
      const { user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: memberToken, user: member } = await createUser({ role: ROLES.TEAM_MEMBER });

      const project = await Project.create({
        name: 'Member Project',
        startDate: new Date(),
        manager: pm._id,
        teamMembers: [member._id],
      });

      await Task.create({
        title: 'Task B',
        project: project._id,
        assignedTo: member._id,
        deadline: new Date(Date.now() + 86400000),
        createdBy: pm._id,
        status: 'COMPLETED',
      });

      const res = await request(app).get('/api/member/dashboard').set('Authorization', authHeader(memberToken));

      expect(res.status).toBe(200);
      expect(res.body.data.completedTasks).toBe(1);
      expect(res.body.data.assignedProjects.length).toBe(1);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/member/dashboard');
      expect(res.status).toBe(401);
    });
  });
});