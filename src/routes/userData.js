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
router.get('/:key', getUserData); // read
router.put('/:key', updateUserData); // update
router.delete('/:key', deleteUserData); // delete

module.exports = router;
