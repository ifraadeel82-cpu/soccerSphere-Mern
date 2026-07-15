const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  contact: { type: String, trim: true },
  hiredDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
