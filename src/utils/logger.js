const SystemLog = require('../models/SystemLog');

async function createSystemLog({ user = null, action, meta = {}, ip = null, userAgent = null }) {
  try {
    const log = await SystemLog.create({
      user,
      action,
      meta,
      ipAddress: ip || null,
      userAgent: userAgent || null,
    });
    return log;
  } catch (err) {
    console.error('Failed to create system log', err);
    return null;
  }
}

module.exports = { createSystemLog };