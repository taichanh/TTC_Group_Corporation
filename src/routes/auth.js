const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { loginLimiter } = require('../middleware/rateLimit');
const { register, login } = require('../controllers/authController');

// Validators
const validateRegister = [
	body('email').isEmail().withMessage('Invalid email'),
	body('password').isLength({ min: 6 }).withMessage('Password too short'),
	body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
];

const validateLogin = [
	body('email').isEmail().withMessage('Invalid email'),
	body('password').notEmpty().withMessage('Password required'),
];

router.post('/register', validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);

module.exports = router;
