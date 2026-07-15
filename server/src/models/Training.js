const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', default: null },
  scheduledDate: { type: Date, required: true },
  durationMinutes: { type: Number, default: 90 },
  location: { type: String, trim: true },
  attendance: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    attended: { type: Boolean, default: false },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Training', trainingSchema);
