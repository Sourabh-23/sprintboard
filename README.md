# SprintBoard

SprintBoard is a Jira-style sprint and task management app with an Express/PostgreSQL backend and a simple frontend served by the same server.

## Features

- Register and login with JWT
- Refresh token endpoint for renewing access tokens
- CORS, Helmet, HPP, rate limiting, input sanitization, and Winston logging
- Nodemailer email notifications in free local mode
- SSE event stream for live issue/comment updates
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

Events:

```text
GET /api/events
```

## Main APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
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

## Optional Email Config

Without SMTP variables, emails are generated and logged locally for free. To send real emails, add:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_user
SMTP_PASS=your_password
MAIL_FROM="SprintBoard <no-reply@example.com>"
```
