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
const backupSchedulesRoutes = require('./routes/backupSchedules');
const auditTrailsRoutes = require('./routes/auditTrails');
const notificationRoutes = require('./routes/notifications');
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

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to TTC Group Corporation API');
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/user-data', userDataRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/restore', restoreRoutes);
app.use('/api/v1/backups', backupsRoutes);
app.use('/api/v1/backup-schedules', backupSchedulesRoutes);
app.use('/api/v1/audit-trails', auditTrailsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

// Initialize backup cron after server starts
initBackupCron();

module.exports = app;
