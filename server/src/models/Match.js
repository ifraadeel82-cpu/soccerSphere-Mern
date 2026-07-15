const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium', required: true },
  matchDate: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'], default: 'Scheduled' },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  ticketPrice: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  bookedSeats: { type: Number, default: 0 },
  sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' }],
  isWorldCup: { type: Boolean, default: false },
  // Replaces MatchStatusLog trigger
  statusLog: [{
    oldStatus: String,
    newStatus: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

matchSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - this.bookedSeats;
});

module.exports = mongoose.model('Match', matchSchema);
