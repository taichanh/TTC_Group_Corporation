/*
Demo script: Full restore scenario
Requirements: server running (npm run dev) and Node 18+ (for global fetch)

Steps:
- create admin and user
- create user-data for user
- admin triggers backup
- poll backups until completed
- user requests restore
- admin approves and executes restore
- verify user-data exists after restore

Usage:
  node scripts/demo_restore.js

Environment variables (optional):
  BASE_URL - default http://localhost:4000
  ADMIN_EMAIL, ADMIN_PASSWORD - credentials for admin (script will register if missing)
  USER_EMAIL, USER_PASSWORD - credentials for user (script will register if missing)

*/

const wait = ms => new Promise(r => setTimeout(r, ms));
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpass';
const USER_EMAIL = process.env.USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.USER_PASSWORD || 'userpass';

async function http(path, opts = {}){
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, opts);
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch(e){ body = text; }
  return { status: res.status, body };
}

async function ensureRegister(email, password, name, role){
  // try login first
  const login = await http('/api/v1/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  if (login.status === 200) return login.body.token;
  // register
  const reg = await http('/api/v1/auth/register', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, password, name, role })
  });
  if (reg.status === 201) {
    const l = await http('/api/v1/auth/login', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password })
    });
    return l.body.token;
  }
  throw new Error('Unable to ensure register: ' + JSON.stringify(reg));
}

async function pollBackup(timeoutMs = 120000, interval = 3000){
  const start = Date.now();
  while(Date.now() - start < timeoutMs){
    const res = await http('/api/v1/backups', { method: 'GET', headers: {'Content-Type':'application/json','Authorization': `Bearer ${adminToken}`} });
    if (res.status === 200 && Array.isArray(res.body.data)){
      const completed = res.body.data.find(b => b.status === 'completed');
      if (completed) return completed;
    }
    await wait(interval);
  }
  throw new Error('Timed out waiting for backup to complete');
}

let adminToken, userToken, userId;

(async function run(){
  try{
    console.log('Ensuring admin registration...');
    adminToken = await ensureRegister(ADMIN_EMAIL, ADMIN_PASSWORD, 'Admin', 'admin');
    console.log('Admin token obtained');

    console.log('Ensuring user registration...');
    userToken = await ensureRegister(USER_EMAIL, USER_PASSWORD, 'Demo User', 'user');
    console.log('User token obtained');

    // get user id
    const me = await http('/api/v1/users/me', { method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } });
    if (me.status !== 200) throw new Error('Failed to get me: ' + JSON.stringify(me));
    userId = me.body.data._id;
    console.log('User id:', userId);

    // create user data
    console.log('Creating user data...');
    const ud = await http('/api/v1/user-data', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ key: 'demo-profile', data: { bio: 'demo backup content', ts: new Date().toISOString() } })
    });
    console.log('Create user-data status:', ud.status);

    // trigger backup as admin
    console.log('Triggering backup (admin)...');
    const trig = await http('/api/v1/backups/trigger', { method: 'POST', headers: { 'Authorization': `Bearer ${adminToken}` } });
    console.log('Trigger response:', trig.status, trig.body);

    // poll for completed backup
    console.log('Polling for completed backup (this may take a few seconds)...');
    const backupDoc = await pollBackup(120000, 3000);
    console.log('Found completed backup:', backupDoc._id, 'storageRef=', backupDoc.storageRef);

    // request restore as user (restores user's own data)
    console.log('Requesting restore as user...');
    const reqRestore = await http('/api/v1/restore/requests', {
      method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${userToken}` }, body: JSON.stringify({ restoreType: 'DATA' })
    });
    console.log('Restore request response:', reqRestore.status, reqRestore.body);
    const restoreId = reqRestore.body.data._id;

    // approve as admin
    console.log('Approving restore as admin...');
    const approve = await http(`/api/v1/restore/requests/${restoreId}/approve`, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${adminToken}` }, body: JSON.stringify({ backupRef: backupDoc._id }) });
    console.log('Approve response:', approve.status, approve.body);

    // execute as admin
    console.log('Executing restore as admin...');
    const exec = await http(`/api/v1/restore/requests/${restoreId}/execute`, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${adminToken}` }, body: JSON.stringify({}) });
    console.log('Execute response:', exec.status, exec.body);

    // verify user-data
    console.log('Listing user-data for user...');
    const list = await http('/api/v1/user-data', { method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } });
    console.log('User-data list status:', list.status, JSON.stringify(list.body, null, 2));

    console.log('Demo complete.');
  } catch (err) {
    console.error('Demo failed:', err);
  }
})();
