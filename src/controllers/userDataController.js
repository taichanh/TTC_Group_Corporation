const UserData = require('../models/UserData');
const { createSystemLog } = require('../utils/logger');

// Create
const createUserData = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const { key, data, tags } = req.body;
    if (!key || data === undefined) return res.status(400).json({ message: 'key and data are required' });
    const doc = await UserData.create({ owner, key, data, tags: tags || [] });
    await createSystemLog({ user: owner, action: 'USERDATA_CREATE', meta: { key } });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'key already exists for owner' });
    next(err);
  }
};

// Read list (own)
const listUserData = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = { owner: req.user._id };
    if (q) filter.key = new RegExp(q, 'i');
    const docs = await UserData.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
};

// Read single
const getUserData = async (req, res, next) => {
  try {
    const doc = await UserData.findOne({ owner: req.user._id, key: req.params.key });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    await createSystemLog({ user: req.user._id, action: 'USERDATA_READ', meta: { key: req.params.key } });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Update
const updateUserData = async (req, res, next) => {
  try {
    const { data, tags } = req.body;
    const setObj = { data };
    if (tags !== undefined) setObj.tags = tags;
    const update = { $set: setObj };
    const doc = await UserData.findOneAndUpdate(
      { owner: req.user._id, key: req.params.key },
      update,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Delete
const deleteUserData = async (req, res, next) => {
  try {
    const r = await UserData.deleteOne({ owner: req.user._id, key: req.params.key });
    if (r.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    await createSystemLog({ user: req.user._id, action: 'USERDATA_DELETE', meta: { key: req.params.key } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { createUserData, listUserData, getUserData, updateUserData, deleteUserData };
