const SystemLog = require('../models/SystemLog');

async function createSystemLog({ user = null, action, meta = {}, ip = null }) {
  try {
    const log = await SystemLog.create({
      user,
      action,
      meta,
      ip
    });
    return log;
  } catch (err) {
    console.error('Failed to create system log', err);
    return null;
  }
}

module.exports = { createSystemLog };