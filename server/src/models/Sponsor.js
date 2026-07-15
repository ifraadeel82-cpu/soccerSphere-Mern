const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  industry: { type: String, trim: true },
  contactEmail: { type: String, trim: true, lowercase: true },
  logoUrl: { type: String, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Sponsor', sponsorSchema);
