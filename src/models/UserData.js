const mongoose = require('mongoose');

// Represents arbitrary user-owned data/document records
const userDataSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true }, // logical key/name
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON payload
  tags: [{ type: String }],
}, { timestamps: true });

userDataSchema.index({ owner: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('UserData', userDataSchema);
