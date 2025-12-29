const fs = require('fs');
const path = require('path');

class LocalStorage {
  constructor(baseDir) {
    this.baseDir = baseDir || path.join(process.cwd(), 'backups');
    if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true });
  }

  async writeJSON(name, json) {
    const filePath = path.join(this.baseDir, name);
    await fs.promises.writeFile(filePath, JSON.stringify(json, null, 2));
    return filePath;
  }

  async readJSON(nameOrPath) {
    const maybePath = path.isAbsolute(nameOrPath) ? nameOrPath : path.join(this.baseDir, nameOrPath);
    const data = await fs.promises.readFile(maybePath, 'utf8');
    return JSON.parse(data);
  }
}

module.exports = LocalStorage;
