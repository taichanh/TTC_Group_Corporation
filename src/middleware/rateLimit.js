const rateLimit = require('express-rate-limit');

// Basic rate limiter for login to mitigate brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Too many login attempts, please try again later.' },
});

module.exports = { loginLimiter };
