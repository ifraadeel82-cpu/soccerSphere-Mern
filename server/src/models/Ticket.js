const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  fan: { type: mongoose.Schema.Types.ObjectId, ref: 'Fan', required: true },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  seatNumber: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' },
  payment: {
    amount: { type: Number, required: true },
    method: { type: String, enum: ['Cash', 'Card', 'Online'], required: true },
    paidAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Paid', 'Refunded'], default: 'Paid' },
  },
  // Replaces TicketLog trigger
  log: [{
    action: { type: String, enum: ['Booked', 'Cancelled', 'Refunded'] },
    performedAt: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, { timestamps: true });

ticketSchema.index({ fan: 1, match: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
