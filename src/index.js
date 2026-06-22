const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./modules/auth/auth.routes');
const projectsRoutes = require('./modules/projects/projects.routes');
const issuesRoutes = require('./modules/issues/issues.routes');
const sprintsRoutes = require('./modules/sprints/sprints.routes');
const commentsRoutes = require('./modules/comments/comments.routes');
const usersRoutes = require('./modules/users/users.routes');

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

db.raw('SELECT 1')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/sprints', sprintsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'SprintBoard API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
