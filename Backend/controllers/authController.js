const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../middleware/authMiddleware');

const BCRYPT_ROUNDS = 12;

/**
 * Timing-safe string comparison using crypto.timingSafeEqual.
 * Prevents timing attacks that could reveal password length/content.
 */
function timingSafeCompare(a, b) {
  try {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) {
      // Still run comparison to keep timing consistent
      crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Input validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All registration fields are required.' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    // Password strength: minimum 8 characters
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already in use.' });
    }

    // Hash with bcrypt (BCRYPT_ROUNDS = 12 ~ 250ms, strong against brute force)
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      profileType: null,
      isSetupCompleted: false,
      profileDetails: {}
    });

    await newUser.save();

    // Sign JWT — include minimal claim set, never include password
    const tokenPayload = {
      id: newUser._id.toString(),
      email: newUser.email,
      role: 'user',
      name: newUser.name
    };
    const token = signToken(tokenPayload);

    // Build safe user response (never expose password or internal fields)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: 'user',
      profileType: null,
      isSetupCompleted: false,
    };

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error during signup.' });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── 1. Admin credential check (timing-safe, env-controlled) ──────────
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@hirepulse.com').toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    if (!envAdminPassword) {
      console.error('[SECURITY] ADMIN_PASSWORD is not set in .env!');
    }

    const isAdminEmail = timingSafeCompare(normalizedEmail, envAdminEmail);
    const isAdminPassword = envAdminPassword
      ? timingSafeCompare(password, envAdminPassword)
      : false;

    if (isAdminEmail && isAdminPassword) {
      const adminPayload = {
        id: 'admin',
        email: envAdminEmail,
        role: 'admin',
        name: 'System Admin'
      };
      const token = signToken(adminPayload);

      return res.status(200).json({
        message: 'Admin authorization successful.',
        token,
        user: {
          name: 'System Admin',
          email: envAdminEmail,
          role: 'admin',
          isSetupCompleted: true
        }
      });
    }

    // ── 2. Standard candidate user lookup ────────────────────────────────
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Generic error — don't reveal whether email exists
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // ── Password verification with transparent SHA-256 → bcrypt migration ──
    // SHA-256 hashes are exactly 64 lowercase hex characters.
    // Bcrypt hashes start with '$2b$' or '$2a$'.
    const isSha256Hash = /^[0-9a-f]{64}$/.test(user.password);
    let passwordMatch = false;

    if (isSha256Hash) {
      // Legacy path: compare with SHA-256, then re-hash with bcrypt on success
      const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
      passwordMatch = timingSafeCompare(sha256Hash, user.password);
      if (passwordMatch) {
        // Silently upgrade to bcrypt — user won't notice anything
        try {
          user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
          await user.save();
          console.log(`[auth] Auto-migrated password for ${user.email} from SHA-256 to bcrypt`);
        } catch (migErr) {
          console.error(`[auth] Password migration failed for ${user.email}:`, migErr.message);
          // Non-fatal — user still logs in, migration just didn't persist
        }
      }
    } else {
      // Modern path: bcrypt compare (timing-safe by design)
      passwordMatch = await bcrypt.compare(password, user.password);
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: 'user',
      name: user.name
    };
    const token = signToken(tokenPayload);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: 'user',
      profileType: user.profileType,
      isSetupCompleted: user.isSetupCompleted,
    };

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

// ─── POST /api/auth/setup-profile ────────────────────────────────────────
// Protected: requires valid JWT. req.user is set by requireAuth middleware.
exports.setupProfile = async (req, res) => {
  try {
    const { profileType, profileDetails } = req.body;

    // userId comes from the verified JWT — not from request body
    const userId = req.user.id;

    if (!profileType || !profileDetails) {
      return res.status(400).json({ error: 'Missing profile parameters.' });
    }

    // Whitelist allowed profile types
    const allowedTypes = ['student', 'fresher', 'experienced'];
    if (!allowedTypes.includes(profileType)) {
      return res.status(400).json({ error: 'Invalid profile type.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.profileType = profileType;
    user.profileDetails = profileDetails;
    user.isSetupCompleted = true;

    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: 'user',
      profileType: user.profileType,
      isSetupCompleted: user.isSetupCompleted,
    };

    return res.status(200).json({
      message: 'Profile details saved successfully.',
      user: userResponse
    });
  } catch (err) {
    console.error('Setup profile error:', err);
    return res.status(500).json({ error: 'Server error during profile setup.' });
  }
};

// ─── POST /api/auth/migrate-passwords ────────────────────────────────────
// Admin-only utility route: re-hash all existing SHA-256 passwords to bcrypt.
// Run ONCE after deploying this update, then disable by removing the route.
exports.migratePasswords = async (req, res) => {
  try {
    // Check admin authorization
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const users = await User.find({ password: { $exists: true } });
    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      // SHA-256 hashes are exactly 64 hex chars; bcrypt hashes start with '$2b$'
      const isSha256 = /^[0-9a-f]{64}$/.test(user.password);
      if (isSha256) {
        // We cannot reverse SHA-256, so we must invalidate and force a password reset
        // For this app we mark it with a known sentinel so the user must reset
        user.password = await bcrypt.hash(`RESET_REQUIRED_${Date.now()}`, BCRYPT_ROUNDS);
        user.mustResetPassword = true;
        await user.save();
        migrated++;
      } else {
        skipped++;
      }
    }

    return res.status(200).json({
      message: 'Password migration complete.',
      migrated,
      skipped,
      note: 'Users with old SHA-256 passwords have been flagged as mustResetPassword. They will need to reset via /api/auth/reset-password.'
    });
  } catch (err) {
    console.error('Migration error:', err);
    return res.status(500).json({ error: 'Server error during migration.' });
  }
};
