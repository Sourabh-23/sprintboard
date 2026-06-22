const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./modules/auth/auth.routes');
const projectsRoutes = require('./modules/projects/projects.routes');
const issuesRoutes = require('./modules/issues/issues.routes');
const sprintsRoutes = require('./modules/sprints/sprints.routes');
const commentsRoutes = require('./modules/comments/comments.routes');
const usersRoutes = require('./modules/users/users.routes');
const eventsRoutes = require('./modules/events/events.routes');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const sanitizeInput = require('./middleware/sanitizeInput');
const { apiLimiter } = require('./middleware/rateLimiters');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(hpp());
app.use(sanitizeInput);
app.use(requestLogger);
app.use('/api', apiLimiter);
app.use(express.static(path.join(__dirname, '../public')));

db.raw('SELECT 1')
  .then(() => logger.info('Database connected successfully'))
  .catch((err) => logger.error('Database connection failed', err));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/sprints', sprintsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'SprintBoard API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
