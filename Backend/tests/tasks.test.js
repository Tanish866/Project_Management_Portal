const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const { createUser, authHeader, ROLES } = require('./testHelpers');
const Project = require('../src/models/Project');

beforeAll(async () => connectTestDB());
afterEach(async () => clearTestDB());
afterAll(async () => closeTestDB());

/**
 * Creates a project owned by the given PM with one team member already added.
 */
const setupProjectWithMember = async (pmId, memberId) => {
  return Project.create({
    name: 'Task Test Project',
    startDate: new Date(),
    manager: pmId,
    teamMembers: [memberId],
  });
};

const taskPayload = (overrides = {}) => ({
  title: 'Sample Task',
  description: 'A task for testing',
  deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

describe('Tasks API', () => {
  describe('POST /api/projects/:projectId/tasks', () => {
    it('allows the owning PM to create and assign a task', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const project = await setupProjectWithMember(pm._id, member._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload({ assignedTo: member._id.toString(), priority: 'HIGH' }));

      expect(res.status).toBe(201);
      expect(res.body.data.task.priority).toBe('HIGH');
      expect(res.body.data.task.assignedTo._id).toBe(member._id.toString());
    });

    it('rejects assigning a task to a user not on the project team', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { user: outsider } = await createUser({ role: ROLES.TEAM_MEMBER });
      const project = await setupProjectWithMember(pm._id, member._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload({ assignedTo: outsider._id.toString() }));

      expect(res.status).toBe(400);
    });

    it('forbids a team member from creating a task', async () => {
      const { token: memberToken, user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const project = await setupProjectWithMember(pm._id, member._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(memberToken))
        .send(taskPayload());

      expect(res.status).toBe(403);
    });

    it('rejects task creation with a missing deadline', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const project = await setupProjectWithMember(pm._id, pm._id);

      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send({ title: 'No deadline task' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects/:projectId/tasks', () => {
    it('shows a team member only their assigned tasks', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: memberToken, user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { user: member2 } = await createUser({ role: ROLES.TEAM_MEMBER });
      const project = await setupProjectWithMember(pm._id, member._id);
      project.teamMembers.push(member2._id);
      await project.save();

      await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload({ assignedTo: member._id.toString(), title: 'Mine' }));

      await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload({ assignedTo: member2._id.toString(), title: 'Not mine' }));

      const res = await request(app)
        .get(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(memberToken));

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].title).toBe('Mine');
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('allows the assignee to update task status', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: memberToken, user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const project = await setupProjectWithMember(pm._id, member._id);

      const createRes = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload({ assignedTo: member._id.toString() }));
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Authorization', authHeader(memberToken))
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('COMPLETED');
    });

    it('forbids a team member from updating a task not assigned to them', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const { token: otherMemberToken, user: otherMember } = await createUser({ role: ROLES.TEAM_MEMBER });
      const project = await setupProjectWithMember(pm._id, member._id);
      project.teamMembers.push(otherMember._id);
      await project.save();

      const createRes = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload({ assignedTo: member._id.toString() }));
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Authorization', authHeader(otherMemberToken))
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(403);
    });

    it('updates project progress when a task is completed', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: memberToken, user: member } = await createUser({ role: ROLES.TEAM_MEMBER });
      const project = await setupProjectWithMember(pm._id, member._id);

      const createRes = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload({ assignedTo: member._id.toString() }));
      const taskId = createRes.body.data.task._id;

      await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Authorization', authHeader(memberToken))
        .send({ status: 'COMPLETED' });

      const projectRes = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', authHeader(pmToken));

      expect(projectRes.body.data.project.progress).toBe(100);
      expect(projectRes.body.data.project.status).toBe('COMPLETED');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('allows the owning PM to fully update a task', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const project = await setupProjectWithMember(pm._id, pm._id);

      const createRes = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload());
      const taskId = createRes.body.data.task._id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', authHeader(pmToken))
        .send({ title: 'Updated title', priority: 'LOW' });

      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe('Updated title');
      expect(res.body.data.task.priority).toBe('LOW');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('allows the owning PM to delete a task', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const project = await setupProjectWithMember(pm._id, pm._id);

      const createRes = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload());
      const taskId = createRes.body.data.task._id;

      const res = await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', authHeader(pmToken));
      expect(res.status).toBe(200);

      const getRes = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', authHeader(pmToken));
      expect(getRes.status).toBe(404);
    });

    it('forbids a non-owning PM from deleting a task', async () => {
      const { token: pmToken, user: pm } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const { token: otherPmToken } = await createUser({ role: ROLES.PROJECT_MANAGER });
      const project = await setupProjectWithMember(pm._id, pm._id);

      const createRes = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', authHeader(pmToken))
        .send(taskPayload());
      const taskId = createRes.body.data.task._id;

      const res = await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', authHeader(otherPmToken));
      expect(res.status).toBe(403);
    });
  });
});
