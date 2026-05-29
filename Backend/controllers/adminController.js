const User = require('../models/User');

// GET /api/admin/students
exports.getStudents = async (req, res) => {
  try {
    // Find all standard users
    const users = await User.find({ role: { $ne: 'admin' } });

    const students = users.map((user) => {
      let completionPercentage = 30; // Base percentage for signup
      let kycStatus = 'Unverified';
      let pendingItems = [];

      if (!user.profileType) {
        completionPercentage = 30;
        kycStatus = 'Unverified';
        pendingItems = ['Select profile type (Student/Fresher/Experienced)', 'Upload CV / ID card', 'KYC identity proof'];
      } else {
        completionPercentage += 20; // Profile type selected

        const details = user.profileDetails || {};

        if (user.profileType === 'student') {
          // Fields: institutionName, universityName, yearOfStudy, studyPeriodStart, studyPeriodEnd, branch, studentIdFile
          const studentFields = ['institutionName', 'universityName', 'branch'];
          let filledFields = studentFields.filter(f => details[f]);
          
          completionPercentage += Math.round((filledFields.length / studentFields.length) * 30);

          if (details.studentIdFile) {
            completionPercentage += 20;
            kycStatus = 'Verified'; // Auto verified for mockup database
          } else {
            pendingItems.push('Student ID Card photo upload');
          }

          studentFields.forEach(f => {
            if (!details[f]) {
              // Convert camelCase to title case
              const displayName = f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              pendingItems.push(`${displayName} detail`);
            }
          });

        } else {
          // Fresher / Experienced
          // Fields: degree, college, gradYear, cvFile, kyc
          const commonFields = ['degree', 'college'];
          let filledFields = commonFields.filter(f => details[f]);

          completionPercentage += Math.round((filledFields.length / commonFields.length) * 15);

          if (details.cvFile) {
            completionPercentage += 15;
          } else {
            pendingItems.push('CV / Resume document upload');
          }

          if (details.kyc && details.kyc.idNumber && details.kyc.kycFile) {
            completionPercentage += 20;
            kycStatus = 'Verified';
          } else {
            pendingItems.push('KYC identity card photo & ID number');
          }

          commonFields.forEach(f => {
            if (!details[f]) {
              const displayName = f.charAt(0).toUpperCase() + f.slice(1);
              pendingItems.push(`${displayName} detail`);
            }
          });

          if (user.profileType === 'experienced') {
            if (details.yearsOfExperience && details.pastJobDomain) {
              completionPercentage += 20;
            } else {
              pendingItems.push('Job domain & years of experience');
            }
          } else {
            // Fresher gets full 20% if KYC/CV are filled
            completionPercentage += 20;
          }
        }
      }

      // Cap at 100
      completionPercentage = Math.min(completionPercentage, 100);

      // If 100% complete and not yet marked verified
      if (completionPercentage === 100) {
        kycStatus = 'Verified';
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileType: user.profileType || 'Not Started',
        completionPercentage,
        kycStatus,
        pendingItems: pendingItems.length > 0 ? pendingItems : ['None (Profile Complete)']
      };
    });

    res.status(200).json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error fetching student directory.' });
  }
};
