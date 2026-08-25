const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const { createUser, authHeader, ROLES } = require('./testHelpers');

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

    it('returns a complete user object with all expected fields and no password', async () => {
      const { user, token } = await createUser({ email: 'complete@example.com', role: ROLES.TEAM_MEMBER });

      const res = await request(app).get('/api/auth/me').set('Authorization', authHeader(token));
      const returnedUser = res.body.data.user;

      expect(res.status).toBe(200);
      expect(returnedUser._id).toBe(user._id.toString());
      expect(returnedUser.name).toBe(user.name);
      expect(returnedUser.email).toBe(user.email);
      expect(returnedUser.role).toBe(ROLES.TEAM_MEMBER);
      expect(returnedUser.isActive).toBe(true);
      expect(returnedUser.createdAt).toBeDefined();
      expect(returnedUser.password).toBeUndefined();
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

  describe('POST /api/auth/forgot-password', () => {
    it('returns a resetToken for an existing user (non-production)', async () => {
      await createUser({ email: 'forgot@example.com' });

      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'forgot@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resetToken).toBeDefined();
      expect(typeof res.body.data.resetToken).toBe('string');
    });

    it('returns the same generic message for a non-existent email (no account-existence leak)', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'ghost@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/if an account with that email exists/i);
      expect(res.body.data).toBeUndefined();
    });

    it('rejects an invalid email format', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    it('resets the password with a valid token and allows login with the new password', async () => {
      await createUser({ email: 'reset@example.com', password: 'OldPassword123' });

      const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: 'reset@example.com' });
      const { resetToken } = forgotRes.body.data;

      const resetRes = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: 'NewPassword123' });

      expect(resetRes.status).toBe(200);

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'reset@example.com',
        password: 'NewPassword123',
      });
      expect(loginRes.status).toBe(200);

      const oldLoginRes = await request(app).post('/api/auth/login').send({
        email: 'reset@example.com',
        password: 'OldPassword123',
      });
      expect(oldLoginRes.status).toBe(401);
    });

    it('rejects an invalid/unknown reset token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/thisisnotarealtoken')
        .send({ password: 'NewPassword123' });

      expect(res.status).toBe(400);
    });

    it('rejects a password shorter than 6 characters', async () => {
      await createUser({ email: 'shortpw@example.com' });
      const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: 'shortpw@example.com' });
      const { resetToken } = forgotRes.body.data;

      const res = await request(app).post(`/api/auth/reset-password/${resetToken}`).send({ password: '123' });
      expect(res.status).toBe(400);
    });

    it('cannot be used twice (token is cleared after a successful reset)', async () => {
      await createUser({ email: 'onceonly@example.com', password: 'OldPassword123' });
      const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: 'onceonly@example.com' });
      const { resetToken } = forgotRes.body.data;

      await request(app).post(`/api/auth/reset-password/${resetToken}`).send({ password: 'NewPassword123' });

      const secondAttempt = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: 'AnotherPassword123' });

      expect(secondAttempt.status).toBe(400);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('changes the password when the current password is correct', async () => {
      const { token } = await createUser({ email: 'changepw@example.com', password: 'CurrentPass123' });

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', authHeader(token))
        .send({ currentPassword: 'CurrentPass123', newPassword: 'BrandNewPass123' });

      expect(res.status).toBe(200);

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'changepw@example.com',
        password: 'BrandNewPass123',
      });
      expect(loginRes.status).toBe(200);
    });

    it('rejects an incorrect current password', async () => {
      const { token } = await createUser({ email: 'wrongcurrent@example.com', password: 'CurrentPass123' });

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', authHeader(token))
        .send({ currentPassword: 'WrongPassword', newPassword: 'BrandNewPass123' });

      expect(res.status).toBe(401);
    });

    it('rejects requests without authentication', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .send({ currentPassword: 'x', newPassword: 'BrandNewPass123' });
      expect(res.status).toBe(401);
    });

    it('rejects a new password shorter than 6 characters', async () => {
      const { token } = await createUser({ email: 'shortnew@example.com', password: 'CurrentPass123' });

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', authHeader(token))
        .send({ currentPassword: 'CurrentPass123', newPassword: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/auth/me', () => {
    it('allows a user to update their own name and email', async () => {
      const { token } = await createUser({ email: 'profile@example.com', name: 'Old Name' });

      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', authHeader(token))
        .send({ name: 'New Name', email: 'newprofile@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('New Name');
      expect(res.body.data.user.email).toBe('newprofile@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('rejects updating to an email already used by another user', async () => {
      await createUser({ email: 'taken@example.com' });
      const { token } = await createUser({ email: 'profile2@example.com' });

      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', authHeader(token))
        .send({ email: 'taken@example.com' });

      expect(res.status).toBe(409);
    });

    it('does not allow changing the role through this route', async () => {
      const { token, user } = await createUser({ email: 'norole@example.com', role: ROLES.TEAM_MEMBER });

      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', authHeader(token))
        .send({ role: 'ADMIN', name: 'Still Team Member' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe(ROLES.TEAM_MEMBER);
    });

    it('rejects requests without authentication', async () => {
      const res = await request(app).put('/api/auth/me').send({ name: 'X' });
      expect(res.status).toBe(401);
    });
  });
});