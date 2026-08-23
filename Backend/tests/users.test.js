const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const { createUser, authHeader, ROLES } = require('./testHelpers');

beforeAll(async () => connectTestDB());
afterEach(async () => clearTestDB());
afterAll(async () => closeTestDB());

describe('Users API (Admin only)', () => {
  describe('POST /api/users', () => {
    it('allows an admin to create a user with any role', async () => {
      const { token } = await createUser({ role: ROLES.ADMIN });

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', authHeader(token))
        .send({
          name: 'New PM',
          email: 'newpm@example.com',
          password: 'Password123',
          role: ROLES.PROJECT_MANAGER,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe(ROLES.PROJECT_MANAGER);
    });

    it('forbids a non-admin from creating users', async () => {
      const { token } = await createUser({ role: ROLES.PROJECT_MANAGER });

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', authHeader(token))
        .send({ name: 'X', email: 'x@example.com', password: 'Password123' });

      expect(res.status).toBe(403);
    });

    it('rejects requests without authentication', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'X', email: 'x2@example.com', password: 'Password123' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users', () => {
    it('allows an admin to list all users', async () => {
      const { token } = await createUser({ role: ROLES.ADMIN });
      await createUser({ email: 'u1@example.com' });
      await createUser({ email: 'u2@example.com' });

      const res = await request(app).get('/api/users').set('Authorization', authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(3);
    });

    it('forbids a team member from listing users', async () => {
      const { token } = await createUser({ role: ROLES.TEAM_MEMBER });
      const res = await request(app).get('/api/users').set('Authorization', authHeader(token));
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('allows an admin to update a user', async () => {
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });
      const { user } = await createUser({ email: 'update@example.com' });

      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', authHeader(adminToken))
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
    });

    it('returns 404 for a non-existent user', async () => {
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });
      const res = await request(app)
        .put('/api/users/64b7f3f3f3f3f3f3f3f3f3f3')
        .set('Authorization', authHeader(adminToken))
        .send({ name: 'Ghost User' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for an invalid ID format', async () => {
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });
      const res = await request(app)
        .put('/api/users/not-a-valid-id')
        .set('Authorization', authHeader(adminToken))
        .send({ name: 'X' });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('allows an admin to change a user role', async () => {
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });
      const { user } = await createUser({ role: ROLES.TEAM_MEMBER });

      const res = await request(app)
        .patch(`/api/users/${user._id}/role`)
        .set('Authorization', authHeader(adminToken))
        .send({ role: ROLES.PROJECT_MANAGER });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe(ROLES.PROJECT_MANAGER);
    });

    it('rejects an invalid role value', async () => {
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });
      const { user } = await createUser({ role: ROLES.TEAM_MEMBER });

      const res = await request(app)
        .patch(`/api/users/${user._id}/role`)
        .set('Authorization', authHeader(adminToken))
        .send({ role: 'SUPER_ADMIN' });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/users/:id/status', () => {
    it('allows an admin to deactivate a user', async () => {
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });
      const { user } = await createUser({ role: ROLES.TEAM_MEMBER });

      const res = await request(app)
        .patch(`/api/users/${user._id}/status`)
        .set('Authorization', authHeader(adminToken))
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.user.isActive).toBe(false);
    });

    it('prevents an admin from deactivating their own account', async () => {
      const { token: adminToken, user: admin } = await createUser({ role: ROLES.ADMIN });

      const res = await request(app)
        .patch(`/api/users/${admin._id}/status`)
        .set('Authorization', authHeader(adminToken))
        .send({ isActive: false });

      expect(res.status).toBe(400);
    });
  });
    describe('GET /api/users/eligible-members', () => {
    it('allows a project manager to list TEAM_MEMBER users', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      await createUser({ name: 'Alice Team', email: 'alice@example.com', role: ROLES.TEAM_MEMBER });
      await createUser({ name: 'Bob Team', email: 'bob@example.com', role: ROLES.TEAM_MEMBER });
      await createUser({ role: ROLES.PROJECT_MANAGER }); // should not appear

      const res = await request(app)
        .get('/api/users/eligible-members')
        .set('Authorization', authHeader(pmToken));

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBe(2);
      expect(res.body.data.users.every((u) => u.email && u.name)).toBe(true);
      expect(res.body.data.users[0].password).toBeUndefined();
    });

    it('allows an admin to list TEAM_MEMBER users', async () => {
      const { token: adminToken } = await createUser({ role: ROLES.ADMIN });
      await createUser({ role: ROLES.TEAM_MEMBER });

      const res = await request(app)
        .get('/api/users/eligible-members')
        .set('Authorization', authHeader(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBe(1);
    });

    it('forbids a team member from accessing this route', async () => {
      const { token } = await createUser({ role: ROLES.TEAM_MEMBER });
      const res = await request(app).get('/api/users/eligible-members').set('Authorization', authHeader(token));
      expect(res.status).toBe(403);
    });

    it('filters by ?search= on name or email (case-insensitive)', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      await createUser({ name: 'Priya Sharma', email: 'priya@example.com', role: ROLES.TEAM_MEMBER });
      await createUser({ name: 'Rahul Verma', email: 'rahul@example.com', role: ROLES.TEAM_MEMBER });

      const res = await request(app)
        .get('/api/users/eligible-members?search=priya')
        .set('Authorization', authHeader(pmToken));

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBe(1);
      expect(res.body.data.users[0].name).toBe('Priya Sharma');
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/users/eligible-members');
      expect(res.status).toBe(401);
    });
  });
});