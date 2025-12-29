const LocalStorage = require('./localStorage');

function getStorage() {
  // Future: read STORAGE_PROVIDER env and return S3 or other providers
  return new LocalStorage(process.env.BACKUP_DIR);
}

module.exports = { getStorage };
