const mongoose = require('mongoose');

const sourceHealthSchema = new mongoose.Schema({
  source: { type: String, unique: true },
  status: String,
  freshness: String,
  records: Number,
  confidence: String,
  lastIngestedAt: { type: Date, default: null },  // Set by n8n ingest controller
}, { timestamps: true });

module.exports = mongoose.model('SourceHealth', sourceHealthSchema);

