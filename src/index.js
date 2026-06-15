const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const db = require('./config/db');
const authRoutes = require('./modules/auth/auth.routes');

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());

db.raw('SELECT 1')
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection failed:', err));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SprintBoard API is running 🚀' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});