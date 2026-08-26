# Project Management Portal

A full-stack web application for managing software projects, teams, tasks, and task comments — built as a Software Engineering project with three role-based access levels: **Admin**, **Project Manager**, and **Team Member**.

This repository contains both halves of the application:

```
Project_Management_Portal/
├── Backend/     # Node.js + Express + MongoDB REST API
└── Frontend/    # React + Redux Toolkit + Tailwind + DaisyUI client
```

Each folder has its own detailed README — start there for setup instructions specific to that part:

- 📘 [`Backend/README.md`](./Backend/README.md) — API setup, environment variables, running the server, running tests, seed data, and the full endpoint reference
- 📘 [`Frontend/README.md`](./Frontend/README.md) — client setup, environment variables, project structure, and how it talks to the backend

## Quick Start

You need both halves running for the app to work end-to-end:

```bash
# 1. Start the backend
cd Backend
npm install
cp .env.example .env      # fill in MONGODB_URI and JWT_SECRET
npm run seed               # optional: sample users/projects/tasks
npm start                  # runs on http://localhost:5000

# 2. In a separate terminal, start the frontend
cd Frontend
npm install
# create a .env pointing the frontend at the backend, e.g.:
# VITE_API_BASE_URL=http://localhost:5000/api
npm run dev                 # runs on http://localhost:5173 (or similar)
```

Then open the frontend URL in your browser and log in with one of the seeded accounts (see `Backend/README.md` → **Test Credentials**).

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, express-validator |
| Frontend | React, Redux Toolkit, React Router, Tailwind CSS, DaisyUI, Axios |
| Testing | Jest + Supertest + mongodb-memory-server (backend) |
| Docs | Swagger/OpenAPI (backend, served at `/api-docs`) |

## User Roles (summary)

- **Admin** — manages users, views all projects system-wide (read-only)
- **Project Manager** — owns projects, manages their team and tasks
- **Team Member** — works on assigned tasks, comments, updates task status

Full role-by-role permission breakdowns are in `Backend/README.md`.

## License

MIT
