require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { jobs, companies, sourceHealth } = require('./data');
const Job = require('./models/Job');
const Company = require('./models/Company');
const SourceHealth = require('./models/SourceHealth');
const User = require('./models/User');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Job.deleteMany({});
    await Company.deleteMany({});
    await SourceHealth.deleteMany({});

    // Seed demo user (used on the login page) — idempotent (upsert by email)
    const demoPassword = await bcrypt.hash('password123', 12);
    await User.findOneAndUpdate(
      { email: 'alex.dev@hirepulse.com' },
      {
        $setOnInsert: {
          name: 'Alex Dev',
          email: 'alex.dev@hirepulse.com',
          phone: '9876543210',
          password: demoPassword,
          profileType: 'experienced',
          isSetupCompleted: true,
          profileDetails: {
            degree: 'B.Tech Computer Science',
            college: 'IIT Delhi',
            yearsOfExperience: '3',
            pastJobDomain: 'Frontend Development',
          }
        }
      },
      { upsert: true, new: true }
    );
    console.log('Demo user seeded: alex.dev@hirepulse.com / password123');

    // Add deadlines to seeded jobs (some expiring soon, some further out)
    const now = Date.now();
    const jobsToInsert = jobs.map(({ id }, idx) => {
      const jobCopy = { ...jobs[idx] };
      delete jobCopy.id;
      
      // Set deadlines for sample jobs: 1 day, 3 days, 5 days, 10 days out
      if (idx === 0) jobCopy.deadline = new Date(now + 1 * 24 * 60 * 60 * 1000); // Expires tomorrow
      else if (idx === 1) jobCopy.deadline = new Date(now + 3 * 24 * 60 * 60 * 1000); // Expires in 3 days
      else if (idx === 2) jobCopy.deadline = new Date(now + 5 * 24 * 60 * 60 * 1000); // Expires in 5 days
      else if (idx === 3) jobCopy.deadline = new Date(now + 10 * 24 * 60 * 60 * 1000); // Expires in 10 days

      return jobCopy;
    });

    const companiesToInsert = companies.map(({ id, ...rest }) => rest);

    // Map isNew → isRecent for Job schema compatibility
    const jobsWithRecent = jobsToInsert.map(job => {
      const { isNew, ...rest } = job;
      return { ...rest, isRecent: isNew };
    });

    await Job.insertMany(jobsWithRecent);
    await Company.insertMany(companiesToInsert);
    await SourceHealth.insertMany(sourceHealth);

    console.log('Database seeded successfully!');
    console.log(`  ✔ ${jobsWithRecent.length} jobs`);
    console.log(`  ✔ ${companiesToInsert.length} companies`);
    console.log(`  ✔ ${sourceHealth.length} source health records`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
