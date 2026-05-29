const Job = require('../models/Job');

// GET /api/jobs (with filtering and search parameters)
exports.getJobs = async (req, res) => {
  try {
    const { 
      query,       // Name searching (title, company, tags)
      domain,      // Job domain/tags
      salary,      // Salary text
      place,       // Location/Place
      type,        // Type (remote, onsite, hybrid)
      experience,  // Experience (fresher, experienced)
      sort         // Sort options (e.g. 'date' for newest)
    } = req.query;

    let filter = {};

    // 1. Name/Query Search (Matches title or company)
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } }
      ];
    }

    // 2. Domain / Tags
    if (domain && domain !== 'all') {
      filter.$or = [
        { tags: { $regex: domain, $options: 'i' } },
        { title: { $regex: domain, $options: 'i' } }
      ];
    }

    // 3. Salary
    if (salary && salary !== 'all') {
      filter.salary = { $regex: salary, $options: 'i' };
    }

    // 4. Place / Location
    if (place && place !== 'all') {
      filter.location = { $regex: place, $options: 'i' };
    }

    // 5. Remote Type (onsite, remote, hybrid)
    if (type && type !== 'all') {
      filter.remote = { $regex: type, $options: 'i' };
    }

    // 6. Experience Level (fresher, experienced)
    if (experience && experience !== 'all') {
      filter.experience = { $regex: experience, $options: 'i' };
    }

    // Determine Sorting: Sort by newest date (createdAt or posted)
    let queryBuilder = Job.find(filter);
    if (sort === 'date' || !sort) {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const jobs = await queryBuilder;
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: error.message });
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
