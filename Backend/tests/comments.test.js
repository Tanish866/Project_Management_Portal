const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const { createUser, authHeader, ROLES } = require('./testHelpers');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

beforeAll(async () => connectTestDB());
afterEach(async () => clearTestDB());
afterAll(async () => closeTestDB());

const setupTaskFor = async (pmId, memberId) => {
  const project = await Project.create({
    name: 'Comment Test Project',
    startDate: new Date(),
    manager: pmId,
    teamMembers: [memberId],
  });

  const task = await Task.create({
    title: 'Comment Test Task',
    project: project._id,
    assignedTo: memberId,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdBy: pmId,
  });

  return { project, task };
};

describe('Comments API', () => {
  describe('POST /api/tasks/:taskId/comments', () => {
    it('allows the assignee to add a comment', async () => {
      const { user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: memberToken, user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { task } = await setupTaskFor(pm._id, member._id);

      const res = await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(memberToken))
        .send({ message: 'Working on it now.' });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.message).toBe('Working on it now.');
    });

    it('allows the owning PM to add a comment', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { task } = await setupTaskFor(pm._id, member._id);

      const res = await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(pmToken))
        .send({ message: 'Great progress!' });

      expect(res.status).toBe(201);
    });

    it('forbids an unrelated team member from commenting', async () => {
      const { user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { token: outsiderToken } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { task } = await setupTaskFor(pm._id, member._id);

      const res = await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(outsiderToken))
        .send({ message: 'I should not be able to post this.' });

      expect(res.status).toBe(403);
    });

    it('rejects an empty comment message', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { task } = await setupTaskFor(pm._id, member._id);

      const res = await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(pmToken))
        .send({ message: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks/:taskId/comments', () => {
    it('returns comments for an authorized user', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { task } = await setupTaskFor(pm._id, member._id);

      await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(pmToken))
        .send({ message: 'First comment' });

      const res = await request(app)
        .get(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(pmToken));

      expect(res.status).toBe(200);
      expect(res.body.data.comments.length).toBe(1);
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('allows the author to edit their own comment', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { task } = await setupTaskFor(pm._id, member._id);

      const createRes = await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(pmToken))
        .send({ message: 'Original message' });
      const commentId = createRes.body.data.comment._id;

      const res = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', authHeader(pmToken))
        .send({ message: 'Edited message' });

      expect(res.status).toBe(200);
      expect(res.body.data.comment.message).toBe('Edited message');
    });

    it('forbids editing a comment authored by someone else', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: memberToken, user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { task } = await setupTaskFor(pm._id, member._id);

      const createRes = await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(pmToken))
        .send({ message: 'PM comment' });
      const commentId = createRes.body.data.comment._id;

      const res = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', authHeader(memberToken))
        .send({ message: 'Trying to edit' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('allows the owning PM to delete any comment on their project', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: memberToken, user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { task } = await setupTaskFor(pm._id, member._id);

      const createRes = await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', authHeader(memberToken))
        .send({ message: 'Member comment' });
      const commentId = createRes.body.data.comment._id;

      const res = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', authHeader(pmToken));

      expect(res.status).toBe(200);
    });

    it('returns 404 when deleting a non-existent comment', async () => {
      const { token: pmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const res = await request(app)
        .delete('/api/comments/64b7f3f3f3f3f3f3f3f3f3f3')
        .set('Authorization', authHeader(pmToken));
      expect(res.status).toBe(404);
    });
  });
});
