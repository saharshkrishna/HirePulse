const Job = require('../models/Job');
const { jobs: mockJobs } = require('../data');

// GET /api/jobs (with filtering, pagination, deadline sorting and expired filtering)
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
      sort,        // Sort options ('deadline', 'match', 'recent', 'company')
      page = 1,
      limit = 10
    } = req.query;

    const now = new Date();
    // Exclude jobs whose deadline has passed (deadline < current date)
    const conditions = [
      {
        $or: [
          { deadline: { $gt: now } },
          { deadline: null },
          { deadline: { $exists: false } }
        ]
      },
      { isActive: { $ne: false } }
    ];

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

    const filter = { $and: conditions };

    // Primary sorting: Jobs near expiration first (non-null deadline ascending), then null deadlines
    let sortObj = {};
    if (sort === 'match') {
      sortObj = { match: -1 };
    } else if (sort === 'recent') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'company') {
      sortObj = { company: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalJobsCount = await Job.countDocuments(filter);
    
    // Perform custom query/sort: jobs with non-null deadline sorted ascending by deadline, followed by jobs without deadline
    let jobs = await Job.aggregate([
      { $match: filter },
      {
        $addFields: {
          hasDeadline: { $cond: [{ $ifNull: ['$deadline', false] }, 0, 1] }
        }
      },
      {
        $sort: Object.keys(sortObj).length > 0 
          ? { hasDeadline: 1, deadline: 1, ...sortObj }
          : { hasDeadline: 1, deadline: 1, createdAt: -1 }
      },
      { $skip: skip },
      { $limit: limitNum }
    ]);

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

    res.status(200).json({
      jobs: formattedJobs,
      pagination: {
        total: totalJobsCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalJobsCount / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching jobs from database:', error);
    // If DB query fails, fallback to mock data structure
    res.status(200).json({
      jobs: mockJobs,
      pagination: { total: mockJobs.length, page: 1, limit: 10, totalPages: 1 }
    });
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
