const http = require('http');
const https = require('https');
const { URL } = require('url');

function sendWebhook(event, payload = {}) {
  const webhook = process.env.NOTIFY_WEBHOOK;
  if (!webhook) return Promise.resolve(null);
  try {
    const url = new URL(webhook);
    const data = JSON.stringify({ event, payload, ts: new Date().toISOString() });
    const lib = url.protocol === 'https:' ? https : http;
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    return new Promise((resolve, reject) => {
      const req = lib.request(opts, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

module.exports = { sendWebhook };
