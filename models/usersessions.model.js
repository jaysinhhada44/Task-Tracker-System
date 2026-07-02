const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const usersessionSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: { type: String },
  deviceid: { type: String, default: '' },
  isactive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('userSession', usersessionSchema);
