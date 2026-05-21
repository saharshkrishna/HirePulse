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
  isRecent: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
