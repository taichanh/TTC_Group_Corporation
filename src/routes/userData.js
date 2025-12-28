const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createUserData,
  listUserData,
  getUserData,
  updateUserData,
  deleteUserData,
} = require('../controllers/userDataController');

router.use(protect);

router.post('/', createUserData); // create
router.get('/', listUserData); // list own
router.get('/:id', getUserData); // read
router.put('/:id', updateUserData); // update
router.delete('/:id', deleteUserData); // delete

module.exports = router;
