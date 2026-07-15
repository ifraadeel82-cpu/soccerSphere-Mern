const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
  minutesPlayed: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 10, default: null },
}, { timestamps: true });

performanceSchema.index({ player: 1, match: 1 }, { unique: true });

module.exports = mongoose.model('Performance', performanceSchema);
