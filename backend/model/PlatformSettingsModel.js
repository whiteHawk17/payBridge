const mongoose = require('mongoose');

const PlatformSettingsSchema = new mongoose.Schema({
  transactionFeePercent: { type: Number, default: 2.5 },
  minPayout: { type: Number, default: 100 },
  maxPayout: { type: Number, default: 10000 },
  // Add more settings as needed
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', PlatformSettingsSchema); 