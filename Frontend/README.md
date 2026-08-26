# Project Management Portal — Frontend

## Description

This is the frontend client for the Project Management Portal — a React single-page app that consumes the [backend REST API](../backend/README.md) to give Admins, Project Managers, and Team Members a role-specific dashboard for managing projects, tasks, and comments.

This repository contains **only the frontend**. It talks to the backend entirely over HTTP (via Axios) and holds no business logic of its own beyond UI state and client-side routing/guarding.

## Features

- Role-based dashboards and navigation (Admin / Project Manager / Team Member), each seeing only what their role allows
- JWT-based authentication with protected, role-guarded routes
- Full project and task management UI for Project Managers (create/edit/delete projects, add/remove team members, create/assign/edit tasks)
- Task status updates and threaded comments (add/edit/delete, with author/PM/Admin-aware permissions) for Team Members
- Read-only system-wide project view for Admins
- Reusable UI component library (modals, form fields, avatars, status badges, empty states, loading skeletons, toasts)
- Tailwind CSS + DaisyUI theming using semantic tokens (`base-100/200/300`, `base-content`, `primary`, `secondary`) rather than hardcoded colors, so the whole app reacts to theme changes consistently

## Tech Stack

- React
- Redux Toolkit (`createSlice`, `createAsyncThunk`) for state management
- React Router for client-side routing and route protection
- Axios for API calls
- Tailwind CSS + DaisyUI for styling
- `lucide-react` for icons

> This list reflects what's visible in the code reviewed during development. If your `package.json` specifies different exact versions or an additional library, treat that as the source of truth.

## User Roles

### Admin
- View system-wide dashboard stats
- Manage users (create, view, update, activate/deactivate, change roles)
- View all projects across the system, read-only (no edit/delete controls)

### Project Manager
- View dashboard scoped to their own projects
- Create, edit, delete their own projects (including manually setting status)
- Add/remove team members on their projects
- Create tasks, assign them to team members, edit any task field (title, description, priority, deadline, assignee, status), delete tasks
- View and moderate comments on tasks in their projects (can delete any comment on their project, but can only edit their own)

### Team Member
- View dashboard scoped to their assigned work
- View projects they belong to and tasks assigned to them
- Update the status of their own tasks
- Add comments on tasks they have access to; edit/delete only their own comments

## Project Structure

```
src/
├── Redux/
│   ├── store.js                  # Redux store setup, combines all slices
│   └── slices/
│       ├── AuthSlice.js          # login, register, current-user state
│       ├── AdminSlice.js         # dashboard, users, all-projects (Admin)
│       ├── ManagerSlice.js       # projects, tasks, members (Project Manager)
│       ├── MemberSlice.js        # assigned projects/tasks (Team Member)
│       └── CommentSlice.js       # comments, keyed by taskId
├── Pages/
│   ├── Auth/                     # Login, Signup
│   ├── Admin/                    # AdminDashboard, UserManagement, AdminProjectsPage
│   ├── Manager/                  # ManagerDashboard, ProjectsPage, ProjectDetailPage
│   └── Member/                   # MemberDashboard, MyProjectsPage, ProjectTasksPage, TaskDetailPage
├── Layouts/
│   ├── DashboardLayout.jsx       # shared shell (sidebar/nav) driven by a navItems prop
│   ├── AdminLayout.jsx
│   ├── ManagerLayout.jsx
│   └── MemberLayout.jsx
├── components/
│   ├── ui/                       # Modal, FormField, Avatar, StatusBadge, EmptyState, Skeleton
│   ├── CommentThread.jsx         # comment list + add/edit/delete UI for a single task
│   ├── Toast.jsx
│   └── ProtectedRoute.jsx        # route guard based on auth state + allowedRoles
├── Routes/
│   └── MainRoutes.jsx            # all route definitions
├── hooks/
│   └── useToast.js               # small hook wrapping toast show/clear state
├── config/
│   └── axiosInstance.js          # shared Axios instance (base URL, auth header injection)
└── App.jsx / main.jsx
```

## Installation

Requirements: Node.js 18+, npm, and the backend API running and reachable (locally or deployed).

```bash
git clone <your-frontend-repo-url>
cd project-management-portal-frontend
npm install
```

## Environment Variables

Create a `.env` file in the project root pointing at your backend's base API URL:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Please verify this variable name against your actual `src/config/axiosInstance.js`.** Depending on whether the project was scaffolded with Vite (`import.meta.env.VITE_...`) or Create React App (`process.env.REACT_APP_...`), the exact env var name and prefix will differ. Open `axiosInstance.js` and match whatever it reads from — this doc assumes Vite since that's the modern default, but adjust if the project uses CRA.

## Running the Project

```bash
npm run dev      # Vite dev server (or `npm start` if this is a CRA project)
```

The app will be available at `http://localhost:5173` (Vite default) or `http://localhost:3000` (CRA default). Make sure the backend is running first and `VITE_API_BASE_URL` (or equivalent) points to it, and that the backend's `CORS_ORIGIN` allows this frontend's origin.

## Authentication & Route Protection

- On login/register, the backend returns a JWT which is stored client-side (check `AuthSlice.js` for exactly where — typically `localStorage` or in-memory Redux state) and attached to subsequent requests via `axiosInstance`'s request interceptor.
- `ProtectedRoute.jsx` reads `state.auth.isLoggedin` and `state.auth.user.role`:
  - Not logged in → redirected to `/login`
  - Logged in but role not in the route's `allowedRoles` → redirected to `/`
- `MainRoutes.jsx` wraps every role-specific page in `<ProtectedRoute allowedRoles={[...]}>`.

## State Management

Each Redux slice follows the same pattern:
- `createAsyncThunk` per API call, calling `axiosInstance` and unwrapping `response.data.data`
- `rejectWithValue(error.response?.data?.message || "fallback message")` for errors, so components can read `result.payload` directly
- A shared `loading`/`error` pair per slice, generally set via `addMatcher` on `pending`/`rejected` action types
- List mutations use an `upsertById` helper pattern (update in place if found, otherwise unshift) to keep arrays in sync after create/update thunks resolve

When wiring up a new feature, follow this same thunk shape so error handling and toast messages stay consistent across the app.

## Backend Integration

This frontend expects the backend's consistent response envelope:

```json
{ "success": true, "message": "...", "data": { ... } }
```

and error envelope:

```json
{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }
```

Every thunk's `rejectWithValue` call assumes `error.response.data.message` exists on failure — if the backend ever returns errors in a different shape, thunks across the app will silently fall back to their generic "Failed to ..." messages instead of showing the real reason.

## Test Credentials

These match the backend's `npm run seed` output — useful for logging in during frontend development (development/testing only, never use in production):

| Role             | Email                | Password      |
|-------------------|-----------------------|-----------------|
| Admin              | admin@ppm.test         | Admin@123        |
| Project Manager    | manager1@ppm.test      | Manager@123      |
| Project Manager    | manager2@ppm.test      | Manager@123      |
| Team Member        | member1@ppm.test       | Member@123       |
| Team Member        | member2@ppm.test       | Member@123       |

## Known Issues / Things to Double-Check

- **Import path casing inconsistency**: some files import slices from `../../redux/slices/...` (lowercase `redux`) while others use `../../Redux/slices/...` (capital `Redux`). This works on case-insensitive filesystems (Windows, macOS default) but **will break on case-sensitive filesystems** (Linux — including most production build/deploy environments). Before deploying, grep the codebase for both casings and standardize on one (the actual folder name, `Redux/`, suggests the capitalized form is correct and the lowercase imports are the ones to fix).
- **No `.env.example`** is assumed to exist yet for the frontend — add one so the required API base URL variable is discoverable without reading `axiosInstance.js`.
- Token storage/expiry handling (what happens on a 401 from an expired token — silent logout? redirect to login?) should be double-checked in `axiosInstance.js`'s response interceptor, if one exists.

## Future Improvements

- Add `.env.example` for the frontend
- Standardize the `Redux`/`redux` import casing issue above
- Add a frontend test suite (e.g. Vitest/Jest + React Testing Library) mirroring the backend's coverage
- Add a global 401-response interceptor to auto-redirect to `/login` on token expiry, if not already present
- Loading/error boundary at the route level for network failures, not just per-page states

## License

MIT