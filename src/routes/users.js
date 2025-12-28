const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, getProfile, updateProfile, deleteMe } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getAllUsers);
// Current user
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/me', protect, deleteMe);

router.get('/:id', protect, getUserById);


module.exports = router;
