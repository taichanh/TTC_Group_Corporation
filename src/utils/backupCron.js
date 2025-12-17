const cron = require('node-cron');
const UserData = require('../models/UserData');
const Backup = require('../models/Backup');
const { getStorage } = require('../services/storage');
const { createSystemLog } = require('./logger');
const ACTIONS = require('./actions');

async function performUserDataFullBackup() {
  const backup = await Backup.create({ type: 'USER_DATA_FULL', status: 'in_progress', startedAt: new Date() });
  await createSystemLog({ action: ACTIONS.BACKUP_START, meta: { backupId: backup._id.toString(), type: 'USER_DATA_FULL' } });
  try {
    const items = await UserData.find({}).lean();
    const storage = getStorage();
    const fileName = `user_data_full_${Date.now()}.json`;
    const filePath = await storage.writeJSON(fileName, items);
    await Backup.findByIdAndUpdate(backup._id, {
      status: 'completed',
      completedAt: new Date(),
      itemCount: items.length,
      storageRef: filePath,
    });
    await createSystemLog({ action: ACTIONS.BACKUP_COMPLETE, meta: { backupId: backup._id.toString(), itemCount: items.length, storageRef: filePath } });
  } catch (err) {
    console.error('Backup failed:', err);
    await Backup.findByIdAndUpdate(backup._id, { status: 'failed', error: err.message });
    await createSystemLog({ action: ACTIONS.BACKUP_FAIL, meta: { backupId: backup._id.toString(), error: err.message } });
  }
}

function initBackupCron() {
  const schedule = process.env.BACKUP_CRON || '0 * * * *'; // default: hourly at minute 0
  try {
    cron.schedule(schedule, () => {
      performUserDataFullBackup();
    });
    console.log(`Backup cron scheduled with pattern: ${schedule}`);
  } catch (e) {
    console.error('Invalid BACKUP_CRON pattern', e);
  }
}

module.exports = { initBackupCron, performUserDataFullBackup };
