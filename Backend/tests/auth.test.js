const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const { createUser, authHeader } = require('./testHelpers');

beforeAll(async () => connectTestDB());
afterEach(async () => clearTestDB());
afterAll(async () => closeTestDB());

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user as TEAM_MEMBER', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('TEAM_MEMBER');
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.token).toBeDefined();
    });

    it('does not allow registering with an admin role', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Sneaky Admin',
        email: 'sneaky@example.com',
        password: 'Password123',
        role: 'ADMIN',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('TEAM_MEMBER');
    });

    it('rejects duplicate email registration', async () => {
      await createUser({ email: 'dup@example.com' });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Dup User',
        email: 'dup@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid input (missing fields)', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'bad@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects mismatched confirmPassword', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Mismatch',
        email: 'mismatch@example.com',
        password: 'Password123',
        confirmPassword: 'Different123',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      await createUser({ email: 'login@example.com', password: 'Password123' });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('rejects an invalid password', async () => {
      await createUser({ email: 'login2@example.com', password: 'Password123' });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login2@example.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
    });

    it('rejects login for a deactivated user', async () => {
      await createUser({ email: 'inactive@example.com', password: 'Password123', isActive: false });

      const res = await request(app).post('/api/auth/login').send({
        email: 'inactive@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(401);
    });

    it('rejects login for a non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'ghost@example.com',
        password: 'Password123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the current user when authenticated', async () => {
      const { user, token } = await createUser({ email: 'me@example.com' });

      const res = await request(app).get('/api/auth/me').set('Authorization', authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(user.email);
    });

    it('rejects requests without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects requests with an invalid token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('logs out an authenticated user', async () => {
      const { token } = await createUser({ email: 'logout@example.com' });
      const res = await request(app).post('/api/auth/logout').set('Authorization', authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
