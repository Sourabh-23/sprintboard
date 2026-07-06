# SprintBoard

SprintBoard contains the backend and frontend in one repository.

```text
sprintboard/
  sprintboard_BE/   Node.js, Express and PostgreSQL API
  sprintboard-fe/   React frontend
  scripts/          Workspace development runner
```

## First-time setup

From the project root (`e:\2026\New folder\sprintboard`):

```bash
npm run setup
```

## Run the complete project

```bash
npm start
```

That runs both:

- Frontend at `http://localhost:3000`
- Backend at `http://localhost:4000`

If you need to start just one side:

- Backend only: `npm run dev:be`
- Frontend only: `npm run dev:fe`

