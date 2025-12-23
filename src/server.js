require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const userDataRoutes = require('./routes/userData');
const logRoutes = require('./routes/logs');
const restoreRoutes = require('./routes/restore');
const backupsRoutes = require('./routes/backups');
const { errorHandler } = require('./utils/errorHandler');
const { initBackupCron } = require('./utils/backupCron');

const app = express();

app.use(helmet());
// CORS whitelist
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: (origin, cb) => {
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
  cb(new Error('Not allowed by CORS'));
}}));
app.use(morgan('combined'));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment. Set it in .env');
  process.exit(1);
}
connectDB(MONGO_URI);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/user-data', userDataRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/restore', restoreRoutes);
app.use('/api/v1/backups', backupsRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize backup cron after server starts
initBackupCron();
