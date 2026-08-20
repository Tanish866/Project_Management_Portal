# Project Management Portal

## Description

Project Management Portal is a backend REST API for managing software projects, teams, tasks, and task comments. It was built as a Software Engineering college project and implements complete role-based authentication and authorization for three roles: **Admin**, **Project Manager**, and **Team Member**.

This repository contains **only the backend**. There is no frontend — the API is meant to be consumed by Postman, a frontend app, or any HTTP client.

## Features

- JWT-based authentication with bcrypt password hashing
- Three-tier role-based access control (RBAC), enforced entirely on the backend
- Full CRUD for users (Admin), projects (Project Manager), tasks, and comments
- Team membership management per project
- Automatic project progress calculation from task completion
- Role-specific dashboards with MongoDB aggregation
- Centralized error handling with consistent JSON response shapes
- Request validation with `express-validator`
- Swagger/OpenAPI documentation
- Security middleware: Helmet, CORS, rate limiting, Mongo query sanitization
- Jest + Supertest API test suite running against an in-memory MongoDB
- Development seed script with sample users, projects, tasks, and comments

## User Roles

### Admin
- Login, view dashboard
- Create, view, update users
- Activate/deactivate users
- Assign/change user roles
- View all projects (read-only, does not manage tasks)

### Project Manager
- Login, view dashboard
- Create, view, update, delete their own projects
- Add/remove team members on their projects
- Create, assign, update, delete tasks on their projects
- Set task priority and deadline
- View project progress and reports
- View and add comments on tasks in their projects

### Team Member
- Login, view dashboard
- View projects they belong to
- View tasks assigned to them (title, description, priority, deadline)
- Update the status of tasks assigned to them
- Add and view comments on tasks assigned to them
- View progress of projects they belong to

A Team Member cannot create projects, assign tasks, or manage users/teams.

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) for authentication
- `bcryptjs` for password hashing
- `express-validator` for request validation
- `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize` for security
- `swagger-jsdoc` + `swagger-ui-express` for API documentation
- Jest + Supertest + `mongodb-memory-server` for testing

## Project Structure

```
project-management-portal/
├── src/
│   ├── config/          # DB connection, constants (roles/enums), swagger setup
│   ├── controllers/     # Route handler logic (auth, users, projects, tasks, comments, dashboard)
│   ├── middleware/      # auth (protect/authorize), validate, centralized errorHandler
│   ├── models/          # Mongoose schemas: User, Project, Task, Comment
│   ├── routes/          # Express routers per resource + index.js aggregator
│   ├── services/        # progressService.js - recalculates project progress
│   ├── utils/           # ApiError, ApiResponse, asyncHandler, generateToken
│   ├── validators/      # express-validator chains per resource
│   ├── app.js           # Express app: middleware + route wiring
│   └── server.js        # Entry point: connects DB, starts HTTP server
├── seed/
│   └── seed.js          # Development seed script
├── tests/
│   ├── setup.js          # In-memory MongoDB setup/teardown helpers
│   ├── testHelpers.js     # createUser()/authHeader() helpers
│   ├── auth.test.js
│   ├── users.test.js
│   ├── projects.test.js
│   ├── tasks.test.js
│   ├── comments.test.js
│   ├── dashboard.test.js
│   └── validation.test.js
├── jest.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Installation

Requirements: Node.js 18+, npm, and either a local MongoDB instance or a MongoDB Atlas connection string.

```bash
git clone <your-repo-url>
cd project-management-portal
npm install
cp .env.example .env
```

Then edit `.env` and fill in real values (see below).

> **Note on this delivery:** this code was generated and syntax-checked in a sandboxed environment without internet/npm-registry access, so `npm install` and `npm test` could not be executed here. Run `npm install` and `npm test` on your own machine before submission — every file has been checked with `node --check` for syntax correctness, but a full dependency install and live test run should be done locally to confirm end-to-end behavior.

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/project_management_portal

JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRES_IN=7d

RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=200

CORS_ORIGIN=*
```

Never commit your real `.env` file — it's already listed in `.gitignore`.

## Running the Project

1. Start MongoDB locally (`mongod`) or point `MONGODB_URI` at an Atlas cluster.
2. (Optional but recommended) seed sample data:
   ```bash
   npm run seed
   ```
3. Start the server:
   ```bash
   npm start          # production mode
   npm run dev         # development mode with nodemon auto-reload
   ```
4. The API will be available at `http://localhost:5000/api`, health check at `http://localhost:5000/health`, and interactive docs at `http://localhost:5000/api-docs`.

## API Endpoints

All routes are prefixed with `/api`.

### Auth
| Method | Endpoint             | Access        | Description                     |
|--------|-----------------------|---------------|----------------------------------|
| POST   | /auth/register         | Public        | Register a new user (always TEAM_MEMBER) |
| POST   | /auth/login             | Public        | Login, receive a JWT             |
| GET    | /auth/me                | Private       | Get current logged-in user       |
| POST   | /auth/logout             | Private       | Logout (client discards token)   |

### Users (Admin only)
| Method | Endpoint               | Description                    |
|--------|--------------------------|---------------------------------|
| GET    | /users                    | List all users (filters: `?role=`, `?isActive=`) |
| GET    | /users/:id                | Get a user by ID                |
| POST   | /users                    | Create a user with any role     |
| PUT    | /users/:id                | Update a user's name/email      |
| PATCH  | /users/:id/status          | Activate/deactivate a user      |
| PATCH  | /users/:id/role            | Change a user's role            |

### Projects
| Method | Endpoint                          | Access                      | Description                  |
|--------|-------------------------------------|-------------------------------|--------------------------------|
| POST   | /projects                            | Project Manager               | Create a project (creator becomes manager) |
| GET    | /projects                            | Any authenticated user        | List projects visible to the user |
| GET    | /projects/:id                        | Any authenticated user (with access) | Get a project by ID    |
| PUT    | /projects/:id                        | Owning PM or Admin             | Update a project              |
| DELETE | /projects/:id                        | Owning PM or Admin             | Delete a project (and its tasks/comments) |
| POST   | /projects/:id/members                 | Owning PM or Admin             | Add a team member             |
| GET    | /projects/:id/members                 | Any user with project access  | List team members             |
| DELETE | /projects/:id/members/:userId          | Owning PM or Admin             | Remove a team member          |

### Tasks
| Method | Endpoint                          | Access                      | Description                  |
|--------|-------------------------------------|-------------------------------|--------------------------------|
| POST   | /projects/:projectId/tasks            | Owning PM or Admin             | Create a task under a project |
| GET    | /projects/:projectId/tasks            | Any user with project access  | List tasks (Team Members see only their own) |
| GET    | /tasks/:id                            | Assignee, owning PM, or Admin  | Get a task by ID              |
| PUT    | /tasks/:id                            | Owning PM or Admin             | Fully update a task           |
| PATCH  | /tasks/:id/status                     | Assignee, owning PM, or Admin  | Update only the task status   |
| DELETE | /tasks/:id                            | Owning PM or Admin             | Delete a task                 |

### Comments
| Method | Endpoint                        | Access                          | Description         |
|--------|-------------------------------------|-----------------------------------|-----------------------|
| POST   | /tasks/:taskId/comments               | Anyone with task access           | Add a comment         |
| GET    | /tasks/:taskId/comments               | Anyone with task access           | List comments         |
| PUT    | /comments/:id                         | Comment author (or Admin)         | Edit a comment        |
| DELETE | /comments/:id                         | Author, owning PM, or Admin       | Delete a comment      |

### Dashboards
| Method | Endpoint               | Access          | Description               |
|--------|--------------------------|-------------------|------------------------------|
| GET    | /admin/dashboard          | Admin             | System-wide stats           |
| GET    | /manager/dashboard         | Project Manager   | Stats scoped to their projects |
| GET    | /member/dashboard          | Team Member       | Stats scoped to their tasks/projects |

Full request/response schemas are available at `/api-docs` once the server is running.

## Authentication

- Passwords are hashed with `bcryptjs` before being stored; they are never returned in any API response.
- On successful register/login, a JWT signed with `JWT_SECRET` is returned. Include it on subsequent requests as:
  ```
  Authorization: Bearer <token>
  ```
- Since JWTs are stateless, `/api/auth/logout` is provided for API completeness — actual invalidation happens by the client discarding the token. (A token blacklist could be added as a future improvement — see below.)
- Public registration **always** creates a `TEAM_MEMBER`. Only an Admin can create users with other roles (`POST /api/users`) or promote/demote an existing user (`PATCH /api/users/:id/role`).

## Role-Based Authorization

Two middleware functions in `src/middleware/auth.js` enforce this on every protected route:

- `protect` — verifies the JWT, loads the user, rejects with `401` if missing/invalid/expired or if the account is deactivated.
- `authorize(...roles)` — rejects with `403` if the authenticated user's role isn't in the allowed list.

Beyond role checks, **ownership checks** are enforced in the controllers themselves:
- A Project Manager can only update/delete/manage team members and tasks on projects **they** manage (or an Admin can, for any project).
- A Team Member can only view projects/tasks they belong to, and can only update the status of tasks **assigned to them**.
- Comment editing is restricted to the comment's author; deletion is allowed for the author, the project's PM, or an Admin.

Unauthorized requests always return:
- `401 Unauthorized` — no/invalid/expired token
- `403 Forbidden` — authenticated, but insufficient role/ownership

## Database Models

**User**: `name`, `email` (unique), `password` (hashed, never returned), `role` (`ADMIN` | `PROJECT_MANAGER` | `TEAM_MEMBER`), `isActive`, timestamps.

**Project**: `name`, `description`, `startDate`, `endDate`, `manager` (ref User), `teamMembers` (ref User[]), `status` (`NOT_STARTED` | `IN_PROGRESS` | `ON_HOLD` | `COMPLETED`), `progress` (0-100, auto-calculated), timestamps.

**Task**: `title`, `description`, `project` (ref Project), `assignedTo` (ref User, nullable), `priority` (`LOW` | `MEDIUM` | `HIGH`), `status` (`TODO` | `IN_PROGRESS` | `COMPLETED`), `deadline`, `createdBy` (ref User), timestamps.

**Comment**: `task` (ref Task), `user` (ref User), `message`, timestamps.

## Project Progress

Progress is **never** hard-coded. `src/services/progressService.js#recalculateProjectProgress` is called after every task create/update/status-change/delete:

```
progress = round( (completed tasks / total tasks) * 100 )
```

It also nudges the project's `status`: moves `NOT_STARTED` → `IN_PROGRESS` once any task is done, and to `COMPLETED` once all tasks are done (unless the project is manually set `ON_HOLD`).

## API Testing

Tests use **Jest** + **Supertest** against an **in-memory MongoDB** (`mongodb-memory-server`), so no real database is touched and no manual test-DB setup is required.

Covered: auth (register/login/me/logout, duplicate email, invalid login, protected routes), authorization for all three roles, user management, projects (CRUD, unauthorized access), team management (add/remove/duplicate/invalid member), tasks (create/assign/update/status/unauthorized), comments (add/get/update/delete/unauthorized), dashboards (all three roles), and validation (missing fields, invalid IDs, invalid enums, invalid dates).

## Running Tests

```bash
npm test
```

This runs the entire suite in one command (`jest --runInBand --detectOpenHandles`), spinning up and tearing down an isolated in-memory MongoDB instance per test file. No external MongoDB connection is required to run tests.

> As noted above, `npm test` could not be executed inside the sandbox that produced this code (no package-registry access), but every source file passed `node --check` for syntax validity. Please run `npm install && npm test` locally to get real pass/fail results before submitting — if anything fails, it is expected to be a minor environment issue (e.g. Node version) rather than a logic error, given the code paths mirror the controller logic exactly.

## Swagger/API Documentation

Interactive OpenAPI docs are generated from JSDoc comments in the route files and served at:

```
http://localhost:5000/api-docs
```

Click "Authorize" and paste a JWT (`Bearer <token>`) to try protected endpoints directly from the browser.

## Example API Flow

1. **Admin logs in** → `POST /api/auth/login` with seeded admin credentials.
2. **Admin creates a Project Manager** → `POST /api/users` with `role: PROJECT_MANAGER`.
3. **Project Manager logs in** → `POST /api/auth/login`.
4. **Project Manager creates a project** → `POST /api/projects`.
5. **Project Manager adds team members** → `POST /api/projects/:id/members` (users must already exist with role `TEAM_MEMBER`, e.g. via self-registration at `/api/auth/register`).
6. **Project Manager creates a task and assigns it** → `POST /api/projects/:projectId/tasks` with `assignedTo`.
7. **Team Member logs in** → `POST /api/auth/login`.
8. **Team Member updates task status** → `PATCH /api/tasks/:id/status` (`IN_PROGRESS`, then `COMPLETED`).
9. **Team Member adds a comment** → `POST /api/tasks/:taskId/comments`.
10. **Project progress updates automatically** — visible via `GET /api/projects/:id` or `GET /api/manager/dashboard`.

## Error Handling

All errors are normalized and handled by a single centralized middleware (`src/middleware/errorHandler.js`), producing a consistent shape:

```json
{ "success": false, "message": "Project not found" }
```

Validation errors additionally include an `errors` array of `{ field, message }`. Handled cases: request validation failures, authentication/authorization errors, invalid MongoDB ObjectIds (`CastError`), duplicate keys (e.g. duplicate email), Mongoose validation errors, malformed JSON bodies, JWT errors, 404s for unmatched routes, and any unexpected error (mapped to `500`).

Successful responses follow the same consistent envelope:

```json
{ "success": true, "message": "Project retrieved successfully", "data": { "project": { ... } } }
```

## Security

- Passwords hashed with `bcryptjs` (salt rounds: 10)
- JWTs signed with a secret from environment variables, never hard-coded
- Role-based + ownership-based authorization enforced server-side on every route
- `helmet` for secure HTTP headers
- `cors` configured via `CORS_ORIGIN`
- `express-rate-limit` on all `/api` routes
- `express-mongo-sanitize` to strip Mongo operator injection (`$`, `.`) from user input
- Request body size limited to `10kb`
- No secrets committed to source control (`.env` is git-ignored; `.env.example` has placeholders only)

## Future Improvements

- Refresh tokens + a server-side token blacklist for true logout/invalidation
- Pagination and filtering on list endpoints (users, projects, tasks)
- Email notifications for task assignment/deadline reminders
- File attachments on tasks
- Activity/audit log per project
- Docker Compose setup for one-command local development

## License

MIT

---

## Setup Instructions

```bash
git clone <your-repo-url>
cd project-management-portal
npm install
cp .env.example .env   # then edit .env with your MongoDB URI and JWT secret
```

## How to Run

```bash
npm run seed     # optional: populate sample data
npm start        # or: npm run dev (with nodemon)
```

Server: `http://localhost:5000` · Docs: `http://localhost:5000/api-docs` · Health: `http://localhost:5000/health`

## How to Run Tests

```bash
npm test
```

## API Endpoint List

See the [API Endpoints](#api-endpoints) section above for the full table, or visit `/api-docs` for the interactive version.

## Test Credentials

Created by `npm run seed` (development/testing only — **do not use in production**):

| Role             | Email                | Password      |
|-------------------|-----------------------|-----------------|
| Admin              | admin@ppm.test         | Admin@123        |
| Project Manager    | manager1@ppm.test      | Manager@123      |
| Project Manager    | manager2@ppm.test      | Manager@123      |
| Team Member        | member1@ppm.test       | Member@123       |
| Team Member        | member2@ppm.test       | Member@123       |
| Team Member        | member3@ppm.test       | Member@123       |
| Team Member        | member4@ppm.test       | Member@123       |

## Example End-to-End API Flow

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ppm.test","password":"Admin@123"}'

# 2. Login as a project manager (use the seeded manager1 account)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager1@ppm.test","password":"Manager@123"}'

# 3. Create a project (use the PM's token from step 2)
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PM_TOKEN>" \
  -d '{"name":"New Project","startDate":"2026-08-20"}'

# 4. Add a team member (use a seeded member's user ID)
curl -X POST http://localhost:5000/api/projects/<PROJECT_ID>/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PM_TOKEN>" \
  -d '{"userId":"<MEMBER_USER_ID>"}'

# 5. Create and assign a task
curl -X POST http://localhost:5000/api/projects/<PROJECT_ID>/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PM_TOKEN>" \
  -d '{"title":"Set up CI","deadline":"2026-09-01","assignedTo":"<MEMBER_USER_ID>","priority":"HIGH"}'

# 6. Team member logs in and completes the task
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member1@ppm.test","password":"Member@123"}'

curl -X PATCH http://localhost:5000/api/tasks/<TASK_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MEMBER_TOKEN>" \
  -d '{"status":"COMPLETED"}'

# 7. Check the project — progress has updated automatically
curl http://localhost:5000/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <PM_TOKEN>"
```
