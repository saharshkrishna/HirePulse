require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { getJobs } = require('./controllers/jobController');
const { getCompanies } = require('./controllers/companyController');
const { getSourceHealth } = require('./controllers/healthController');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/jobs', getJobs);
app.get('/api/companies', getCompanies);
app.get('/api/source-health', getSourceHealth);

app.get('/api/stats', async (req, res) => {
  // In a real app, these would be aggregated from the DB
  res.json({
    newJobsToday: 148,
    highFitMatches: 34,
    watchedCompanies: 62,
    healthySources: '92%'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
