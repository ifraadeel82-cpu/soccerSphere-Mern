const mongoose = require('mongoose');

const fanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, trim: true },
  contact: { type: String, default: null },
  address: { type: String, default: null },
  registeredDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Fan', fanSchema);
