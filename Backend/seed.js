require('dotenv').config();
const mongoose = require('mongoose');
const { jobs, companies, sourceHealth } = require('./data');
const Job = require('./models/Job');
const Company = require('./models/Company');
const SourceHealth = require('./models/SourceHealth');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Job.deleteMany({});
    await Company.deleteMany({});
    await SourceHealth.deleteMany({});

    // Remove id fields from mock data (Mongoose will generate _id)
    const jobsToInsert = jobs.map(({ id, ...rest }) => rest);
    const companiesToInsert = companies.map(({ id, ...rest }) => rest);

    // Insert new data
    const jobsWithRecent = jobsToInsert.map(job => {
      const { isNew, ...rest } = job;
      return { ...rest, isRecent: isNew };
    });
    await Job.insertMany(jobsWithRecent);
    await Company.insertMany(companiesToInsert);
    await SourceHealth.insertMany(sourceHealth);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
