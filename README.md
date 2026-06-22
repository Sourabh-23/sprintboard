# SprintBoard

SprintBoard is a Jira-style sprint and task management app with an Express/PostgreSQL backend and a simple frontend served by the same server.

## Features

- Register and login with JWT
- Organization-scoped projects
- Issues with status, priority, type, assignee, and comments
- Sprints with start/complete workflow
- Sprint board grouped by `todo`, `in_progress`, and `done`
- Team/member management

## Setup

Create `.env`:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sprintboard
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
```

Install and run:

```bash
npm install
npm run migrate
npm run dev
```

Open:

```text
http://localhost:4000
```

Health:

```text
GET /api/health
```

## Main APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id/role`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/issues`
- `GET /api/issues?project_id=1`
- `GET /api/issues/:id`
- `PATCH /api/issues/:id`
- `DELETE /api/issues/:id`
- `POST /api/sprints`
- `GET /api/sprints?project_id=1`
- `GET /api/sprints/:id`
- `PATCH /api/sprints/:id`
- `DELETE /api/sprints/:id`
- `PATCH /api/sprints/:id/start`
- `PATCH /api/sprints/:id/complete`
- `POST /api/sprints/:id/issues`
- `DELETE /api/sprints/:id/issues/:issue_id`
- `GET /api/sprints/:id/board`
- `POST /api/comments`
- `GET /api/comments?issue_id=1`
- `DELETE /api/comments/:id`
