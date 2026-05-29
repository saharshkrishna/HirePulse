const crypto = require('crypto');
const User = require('../models/User');

// Helper to hash password using Node built-in crypto
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All registration fields are required.' });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already in use.' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashPassword(password),
      profileType: null,
      isSetupCompleted: false,
      profileDetails: {}
    });

    await newUser.save();

    // Exclude password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Registration successful.',
      user: { ...userResponse, role: 'user' }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();

    // 1. Check against Environment variables for Admin Credentials
    const envAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : 'admin@hirepulse.com';
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin12345';

    if (normalizedEmail === envAdminEmail && password === envAdminPassword) {
      return res.status(200).json({
        message: 'Admin authorization successful.',
        user: {
          name: 'System Admin',
          email: envAdminEmail,
          role: 'admin',
          isSetupCompleted: true
        }
      });
    }

    // 2. Check DB for Standard Candidate User
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare passwords
    if (user.password !== hashPassword(password)) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Login successful.',
      user: { ...userResponse, role: 'user' }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// POST /api/auth/setup-profile
exports.setupProfile = async (req, res) => {
  try {
    const { userId, profileType, profileDetails } = req.body;

    if (!userId || !profileType || !profileDetails) {
      return res.status(400).json({ error: 'Missing profile parameters.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.profileType = profileType;
    user.profileDetails = profileDetails;
    user.isSetupCompleted = true;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Profile details saved successfully.',
      user: { ...userResponse, role: 'user' }
    });
  } catch (err) {
    console.error('Setup profile error:', err);
    res.status(500).json({ error: 'Server error during profile setup.' });
  }
};
