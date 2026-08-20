const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const { createUser, authHeader, ROLES } = require('./testHelpers');

beforeAll(async () => connectTestDB());
afterEach(async () => clearTestDB());
afterAll(async () => closeTestDB());

const projectPayload = (overrides = {}) => ({
  name: 'Test Project',
  description: 'A project for testing',
  startDate: new Date().toISOString(),
  ...overrides,
});

describe('Projects API', () => {
  describe('POST /api/projects', () => {
    it('allows a project manager to create a project', async () => {
      const { token } = await createUser({ role: ROLES.PROJECT_MANAGER });

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(token))
        .send(projectPayload());

      expect(res.status).toBe(201);
      expect(res.body.data.project.name).toBe('Test Project');
      expect(res.body.data.project.status).toBe('NOT_STARTED');
    });

    it('forbids a team member from creating a project', async () => {
      const { token } = await createUser({ role: ROLES.TEAM_MEMBER });

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(token))
        .send(projectPayload());

      expect(res.status).toBe(403);
    });

    it('rejects invalid project data (missing name)', async () => {
      const { token } = await createUser({ role: ROLES.PROJECT_MANAGER });

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(token))
        .send({ startDate: new Date().toISOString() });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    it('returns only projects managed by the requesting PM', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: otherPmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });

      await request(app).post('/api/projects').set('Authorization', authHeader(pmToken)).send(projectPayload());
      await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(otherPmToken))
        .send(projectPayload({ name: 'Other PM project' }));

      const res = await request(app).get('/api/projects').set('Authorization', authHeader(pmToken));

      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.projects[0].manager._id).toBe(pm._id.toString());
    });

    it('returns all projects for an admin', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });

      await request(app).post('/api/projects').set('Authorization', authHeader(pmToken)).send(projectPayload());

      const res = await request(app).get('/api/projects').set('Authorization', authHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(1);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('forbids access to a project the team member does not belong to', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: memberToken } = await createUser({ role: ROLES.TEAM_MEMBER });

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(pmToken))
        .send(projectPayload());

      const projectId = createRes.body.data.project._id;

      const res = await request(app).get(`/api/projects/${projectId}`).set('Authorization', authHeader(memberToken));
      expect(res.status).toBe(403);
    });

    it('returns 404 for a non-existent project', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const res = await request(app)
        .get('/api/projects/64b7f3f3f3f3f3f3f3f3f3f3')
        .set('Authorization', authHeader(pmToken));
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('allows the owning PM to update the project', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(pmToken))
        .send(projectPayload());
      const projectId = createRes.body.data.project._id;

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', authHeader(pmToken))
        .send({ status: 'ON_HOLD' });

      expect(res.status).toBe(200);
      expect(res.body.data.project.status).toBe('ON_HOLD');
    });

    it('forbids a different PM from updating the project', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: otherPmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(pmToken))
        .send(projectPayload());
      const projectId = createRes.body.data.project._id;

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', authHeader(otherPmToken))
        .send({ status: 'ON_HOLD' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('allows the owning PM to delete the project', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(pmToken))
        .send(projectPayload());
      const projectId = createRes.body.data.project._id;

      const res = await request(app).delete(`/api/projects/${projectId}`).set('Authorization', authHeader(pmToken));
      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', authHeader(pmToken));
      expect(getRes.status).toBe(404);
    });
  });

  describe('Team member management', () => {
    it('allows the owning PM to add a team member', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(pmToken))
        .send(projectPayload());
      const projectId = createRes.body.data.project._id;

      const res = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', authHeader(pmToken))
        .send({ userId: member._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.project.teamMembers.length).toBe(1);
    });

    it('rejects adding the same member twice (duplicate)', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(pmToken))
        .send(projectPayload());
      const projectId = createRes.body.data.project._id;

      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', authHeader(pmToken))
        .send({ userId: member._id.toString() });

      const res = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', authHeader(pmToken))
        .send({ userId: member._id.toString() });

      expect(res.status).toBe(409);
    });

    it('rejects adding an invalid/non-existent user as a member', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(pmToken))
        .send(projectPayload());
      const projectId = createRes.body.data.project._id;

      const res = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', authHeader(pmToken))
        .send({ userId: '64b7f3f3f3f3f3f3f3f3f3f3' });

      expect(res.status).toBe(404);
    });

    it('allows the owning PM to remove a team member', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', authHeader(pmToken))
        .send(projectPayload());
      const projectId = createRes.body.data.project._id;

      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', authHeader(pmToken))
        .send({ userId: member._id.toString() });

      const res = await request(app)
        .delete(`/api/projects/${projectId}/members/${member._id}`)
        .set('Authorization', authHeader(pmToken));

      expect(res.status).toBe(200);
      expect(res.body.data.project.teamMembers.length).toBe(0);
    });
  });
});
