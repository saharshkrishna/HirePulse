const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: String,
  logo: String,
  location: String,
  open: Number,
  focus: String
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
