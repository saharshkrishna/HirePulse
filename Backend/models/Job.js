const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  remote: String,
  experience: String,
  salary: String,
  tags: [String],
  source: String,
  posted: String,
  freshness: Number,
  match: Number,
  isRecent: Boolean,

  // n8n scraper fields
  url: { type: String, default: null },           // Original job listing URL (used for dedup)
  description: { type: String, default: null },   // Full job description if scraped
  sourceWorkflow: { type: String, default: null }, // n8n workflow name (e.g. 'naukri-scraper')
  scrapedAt: { type: Date, default: null },        // Timestamp of last n8n scrape
  isActive: { type: Boolean, default: true },      // false = job is stale / no longer live
  deadline: { type: Date, default: null },         // Application deadline if parsed
}, { timestamps: true });

// Index on url for fast dedup lookups
jobSchema.index({ url: 1 }, { sparse: true });
// Index on isActive + createdAt for efficient feed queries
jobSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);

