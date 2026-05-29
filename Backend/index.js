require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { getJobs, createJob, updateJob, deleteJob } = require('./controllers/jobController');
const { getCompanies } = require('./controllers/companyController');
const { getSourceHealth } = require('./controllers/healthController');
const { signup, login, setupProfile } = require('./controllers/authController');
const { getStudents } = require('./controllers/adminController');

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
app.post('/api/jobs', createJob);
app.put('/api/jobs/:id', updateJob);
app.delete('/api/jobs/:id', deleteJob);

app.get('/api/companies', getCompanies);
app.get('/api/source-health', getSourceHealth);

// Auth Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.post('/api/auth/setup-profile', setupProfile);

// Admin Routes
app.get('/api/admin/students', getStudents);

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
