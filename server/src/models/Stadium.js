const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  capacity: { type: Number, required: true },
  surface: { type: String, enum: ['Grass', 'Artificial', 'Hybrid'], default: 'Grass' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Stadium', stadiumSchema);
