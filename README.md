# SprintBoard

SprintBoard contains the backend and frontend in one repository.

```text
sprintboard/
  sprintboard_BE/   Node.js, Express and PostgreSQL API
  sprintboard-fe/   React frontend
  scripts/          Workspace development runner
```

## First-time setup

From the project root:

```bash
npm run setup
```

## Run the complete project

```bash
npm start
```

This starts both applications:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health API: http://localhost:4000/api/health

Press `Ctrl+C` to stop both applications.

To run either application separately:

```bash
npm run dev:be
npm run dev:fe
```
