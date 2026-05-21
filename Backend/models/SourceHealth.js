const mongoose = require('mongoose');

const sourceHealthSchema = new mongoose.Schema({
  source: String,
  status: String,
  freshness: String,
  records: Number,
  confidence: String
}, { timestamps: true });

module.exports = mongoose.model('SourceHealth', sourceHealthSchema);
