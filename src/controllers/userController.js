const User = require('../models/User');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Only admin or the owner can view full user data
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById };

const getProfile = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { fullName, phone, address } = req.body;
    const update = {};
    if (fullName !== undefined) update['profile.fullName'] = fullName;
    if (phone !== undefined) update['profile.phone'] = phone;
    if (address !== undefined) update['profile.address'] = address;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const deleteMe = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserById, getProfile, updateProfile, deleteMe };
