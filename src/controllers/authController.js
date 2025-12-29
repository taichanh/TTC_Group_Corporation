const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // path đúng
const { validationResult } = require('express-validator');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already used' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed, role: role || 'user' });
    // Log action with request context
    const { createSystemLog } = require('../utils/logger');
    await createSystemLog({ user: user._id, action: 'USER_REGISTER', ip: req.ip, userAgent: req.get('User-Agent') });
    return res.status(201).json({ success: true, data: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const { createSystemLog } = require('../utils/logger');
      await createSystemLog({ action: 'USER_LOGIN_FAILED', meta: { email }, ip: req.ip, userAgent: req.get('User-Agent') });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      const { createSystemLog } = require('../utils/logger');
      await createSystemLog({ user: user._id, action: 'USER_LOGIN_FAILED', meta: { reason: 'bad_password' }, ip: req.ip, userAgent: req.get('User-Agent') });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const { createSystemLog } = require('../utils/logger');
    await createSystemLog({ user: user._id, action: 'USER_LOGIN_SUCCESS', ip: req.ip, userAgent: req.get('User-Agent') });
    return res.json({ success: true, token });
  } catch (err) {
    try {
      const { createSystemLog } = require('../utils/logger');
      await createSystemLog({ action: 'USER_LOGIN_FAILED', meta: { email: req.body.email, error: err.message }, ip: req.ip, userAgent: req.get('User-Agent') });
    } catch (_) {}
    next(err);
  }
};

module.exports = { register, login };
