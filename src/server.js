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

connectDB(process.env.MONGO_URI);

app.use(helmet());


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


initBackupCron();app.use(errorHandler);

initBackupCron();

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
