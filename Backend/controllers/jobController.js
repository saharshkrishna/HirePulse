const Job = require('../models/Job');
const { jobs: mockJobs } = require('../data');

// GET /api/jobs (with filtering and search parameters)
exports.getJobs = async (req, res) => {
  try {
    const { 
      query,       // Name searching (title, company, tags)
      domain,      // Job domain/tags
      role,        // Role filter alias
      salary,      // Salary text
      place,       // Location/Place
      type,        // Type (remote, onsite, hybrid)
      remote,      // Remote filter alias
      experience,  // Experience (fresher, experienced, mid, senior)
      sort         // Sort options (e.g. 'date' for newest, 'match')
    } = req.query;

    const conditions = [];

    // 1. Name/Query Search (Matches title, company, or tags)
    if (query && query.trim() !== '' && query !== 'undefined') {
      const q = query.trim();
      conditions.push({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { company: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ]
      });
    }

    // 2. Domain / Role / Tags
    const activeRole = role || domain;
    if (activeRole && activeRole !== 'all' && activeRole !== 'undefined') {
      conditions.push({
        $or: [
          { tags: { $regex: activeRole, $options: 'i' } },
          { title: { $regex: activeRole, $options: 'i' } }
        ]
      });
    }

    // 3. Salary
    if (salary && salary !== 'all' && salary !== 'undefined') {
      conditions.push({ salary: { $regex: salary, $options: 'i' } });
    }

    // 4. Place / Location
    if (place && place !== 'all' && place !== 'undefined') {
      conditions.push({ location: { $regex: place, $options: 'i' } });
    }

    // 5. Remote Type (onsite, remote, hybrid)
    const activeRemote = remote || type;
    if (activeRemote && activeRemote !== 'all' && activeRemote !== 'undefined') {
      conditions.push({ remote: { $regex: activeRemote, $options: 'i' } });
    }

    // 6. Experience Level
    if (experience && experience !== 'all' && experience !== 'undefined') {
      conditions.push({ experience: { $regex: experience, $options: 'i' } });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    let jobs = await Job.find(filter).sort({ createdAt: -1 });

    // If database collection is completely empty, return mockJobs
    const totalCount = await Job.countDocuments();
    if (totalCount === 0) {
      jobs = mockJobs;
    }

    // Ensure objects have both id and _id for frontend compatibility
    const formattedJobs = jobs.map(j => {
      const doc = j.toObject ? j.toObject() : { ...j };
      if (!doc.id && doc._id) doc.id = doc._id.toString();
      if (!doc._id && doc.id) doc._id = doc.id;
      return doc;
    });

    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs from database:', error);
    // If DB query fails, fallback to mock data
    res.status(200).json(mockJobs);
  }
};

// POST /api/jobs (Create a job listing)
exports.createJob = async (req, res) => {
  try {
    const { title, company, location, remote, experience, salary, tags, source } = req.body;

    if (!title || !company) {
      return res.status(400).json({ error: 'Job title and company name are required.' });
    }

    const newJob = new Job({
      title,
      company,
      location: location || 'Remote',
      remote: remote || 'Remote',
      experience: experience || 'experienced',
      salary: salary || 'Competitive',
      tags: tags || [],
      source: source || 'HirePulse Admin',
      posted: 'Just now',
      freshness: 100,
      match: 99,
      isRecent: true
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Server error creating job.' });
  }
};

// PUT /api/jobs/:id (Update a job listing)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, location, remote, experience, salary, tags, source } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    if (title) job.title = title;
    if (company) job.company = company;
    if (location) job.location = location;
    if (remote) job.remote = remote;
    if (experience) job.experience = experience;
    if (salary) job.salary = salary;
    if (tags) job.tags = tags;
    if (source) job.source = source;

    await job.save();
    res.status(200).json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Server error updating job.' });
  }
};

// DELETE /api/jobs/:id (Delete a job listing)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    res.status(200).json({ message: 'Job listing deleted successfully.', id });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Server error deleting job.' });
  }
};
