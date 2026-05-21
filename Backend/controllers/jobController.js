const Job = require('../models/Job');

exports.getJobs = async (req, res) => {
  try {
    const { role, remote, experience, query } = req.query;
    let filter = {};

    if (role && role !== 'all') {
      filter.tags = { $regex: role, $options: 'i' };
    }
    if (remote && remote !== 'all') {
      filter.remote = remote;
    }
    if (experience && experience !== 'all') {
      filter.experience = experience;
    }
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(filter);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
