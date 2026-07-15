const mongoose = require('mongoose');
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  position: { type: String, enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'], required: true },
  nationality: { type: String, trim: true },
  dateOfBirth: { type: Date },
  jerseyNumber: { type: Number },
  isActive: { type: Boolean, default: true },
  isWorldCup: { type: Boolean, default: false },
  phones: [{ type: String }],
  awards: [{ awardName: String, season: String, awardedDate: { type: Date, default: Date.now } }],
}, { timestamps: true });
module.exports = mongoose.model('Player', playerSchema);
