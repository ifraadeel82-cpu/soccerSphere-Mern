const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nationality: { type: String, trim: true },
  licenseLevel: { type: String, trim: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coach', coachSchema);
