const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'units' },
  lowStockThreshold: { type: Number, default: 10 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  // Replaces SupplyAlert trigger
  alerts: [{
    message: String,
    triggeredAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
  }],
}, { timestamps: true, toJSON: { virtuals: true } });

supplySchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

// Auto-create alert when stock drops below threshold (replaces SQL trigger)
supplySchema.pre('save', function (next) {
  if (this.isModified('quantity') && this.quantity <= this.lowStockThreshold) {
    const hasOpenAlert = this.alerts.some(a => !a.resolved);
    if (!hasOpenAlert) {
      this.alerts.push({ message: `Low stock: ${this.name} has ${this.quantity} ${this.unit} left.` });
    }
  }
  next();
});

module.exports = mongoose.model('Supply', supplySchema);
