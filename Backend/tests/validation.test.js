const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const { createUser, authHeader, ROLES } = require('./testHelpers');
const Project = require('../src/models/Project');

beforeAll(async () => connectTestDB());
afterEach(async () => clearTestDB());
afterAll(async () => closeTestDB());

describe('Validation edge cases', () => {
  it('rejects an invalid MongoDB ID format on GET /api/projects/:id', async () => {
    const { token } = await createUser({ role: ROLES.PROJECT_MANAGER });
    const res = await request(app).get('/api/projects/not-a-valid-id').set('Authorization', authHeader(token));
    expect(res.status).toBe(400);
  });

  it('rejects an invalid project status enum value', async () => {
    const { token } = await createUser({ role: ROLES.PROJECT_MANAGER });
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', authHeader(token))
      .send({ name: 'Bad Status Project', startDate: new Date().toISOString(), status: 'DONE' });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid date for project startDate', async () => {
    const { token } = await createUser({ role: ROLES.PROJECT_MANAGER });
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', authHeader(token))
      .send({ name: 'Bad Date Project', startDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid task priority enum value', async () => {
    const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
    const project = await Project.create({ name: 'P', startDate: new Date(), manager: pm._id });

    const res = await request(app)
      .post(`/api/projects/${project._id}/tasks`)
      .set('Authorization', authHeader(pmToken))
      .send({
        title: 'Task',
        priority: 'URGENT',
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(400);
  });

  it('rejects a missing required field on registration', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'No Email' });
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('returns a consistent error response shape for 404s', async () => {
    const { token } = await createUser({ role: ROLES.ADMIN });
    const res = await request(app)
      .get('/api/users/64b7f3f3f3f3f3f3f3f3f3f3')
      .set('Authorization', authHeader(token));
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: expect.any(String) });
  });
});
