const mongoose = require('mongoose');
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  country: { type: String, trim: true },
  founded: { type: Number },
  homeStadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium', default: null },
  logoUrl: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  isWorldCup: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Team', teamSchema);
