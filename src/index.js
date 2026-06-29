const express = require('express'); // Express server framework
const dotenv = require('dotenv'); // Load environment variables from .env
const helmet = require('helmet'); // Secure HTTP headers
const cors = require('cors'); // Allow frontend to access backend
const hpp = require('hpp'); // Prevent HTTP parameter pollution attacks
const db = require('./config/db'); // Database connection




const authRoutes = require('./modules/auth/auth.routes'); // Authentication routes
const projectsRoutes = require('./modules/projects/projects.routes'); // Project routes
const issuesRoutes = require('./modules/issues/issues.routes'); // Issue routes
const sprintsRoutes = require('./modules/sprints/sprints.routes'); // Sprint routes
const commentsRoutes = require('./modules/comments/comments.routes'); // Comment routes
const usersRoutes = require('./modules/users/users.routes'); // User routes
const eventsRoutes = require('./modules/events/events.routes'); // SSE/Event routes




const logger = require('./utils/logger'); // Custom logger
const requestLogger = require('./middleware/requestLogger'); // Log every request
const sanitizeInput = require('./middleware/sanitizeInput'); // Clean user input
const { apiLimiter } = require('./middleware/rateLimiters'); // Rate limiting











dotenv.config(); // Load .env variables

const app = express(); // Create Express application

app.use(helmet()); // Add security headers

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*', // Allowed frontend URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.use(express.json()); // Parse JSON request body
app.use(hpp()); // Protect against parameter pollution
app.use(sanitizeInput); // Sanitize incoming data
app.use(requestLogger); // Log all incoming requests
app.use('/api', apiLimiter); // Apply rate limiting to API routes

db.raw('SELECT 1') // Check database connectivity
  .then(() => logger.info('Database connected successfully'))
  .catch((err) => logger.error('Database connection failed', err));

app.use('/api/auth', authRoutes); // Register auth APIs
app.use('/api/projects', projectsRoutes); // Register project APIs
app.use('/api/issues', issuesRoutes); // Register issue APIs
app.use('/api/sprints', sprintsRoutes); // Register sprint APIs
app.use('/api/comments', commentsRoutes); // Register comment APIs
app.use('/api/users', usersRoutes); // Register user APIs
app.use('/api/events', eventsRoutes); // Register event APIs

app.get('/api/health', (req, res) => { // Health check endpoint
  res.json({ message: 'SprintBoard API is running' });
});

const PORT = process.env.PORT || 4000; // Server port

app.listen(PORT, () => { // Start server
  logger.info(`Server running on port ${PORT}`);
});
