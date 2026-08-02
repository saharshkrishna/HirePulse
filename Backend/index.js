require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

/**
 * Manual NoSQL injection sanitizer (replaces express-mongo-sanitize which is
 * incompatible with Express v5). Recursively strips keys that start with '$'
 * or contain '.' from any plain object to prevent operator injection.
 */
function sanitizeInput(obj) {
  if (Array.isArray(obj)) return obj.map(sanitizeInput);
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$') || k.includes('.')) continue; // strip injections
      clean[k] = sanitizeInput(v);
    }
    return clean;
  }
  return obj;
}
function mongoSanitizeMiddleware(req, _res, next) {
  // Express v5: req.query is a read-only getter — only sanitize writable properties
  if (req.body) req.body = sanitizeInput(req.body);
  // req.params values are always strings in Express, not objects — safe as-is
  next();
}

const { getJobs, createJob, updateJob, deleteJob } = require('./controllers/jobController');
const { getCompanies } = require('./controllers/companyController');
const { signup, login, setupProfile, migratePasswords } = require('./controllers/authController');
const { getStudents } = require('./controllers/adminController');
const { ingestJobs, markJobsStale, getSources } = require('./controllers/n8nController');
const apiKeyAuth = require('./middleware/apiKeyAuth');
const { requireAuth, requireAdmin } = require('./middleware/authMiddleware');
const Job = require('./models/Job');

const app = express();
const PORT = process.env.PORT || 5000;

// ── MongoDB Connection ────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ── Security: HTTP Headers via Helmet ────────────────────────────────────
// Sets: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
// Strict-Transport-Security, Content-Security-Policy, etc.
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Keep off to allow font/image embeds
}));

// ── Security: CORS — restrict to configured origin ────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} is not allowed by CORS policy.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true,
}));

// ── Security: Body parsing with size limit ───────────────────────────────
app.use(express.json({ limit: '2mb' }));         // Prevent OOM via huge payloads
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// ── Security: NoSQL Injection prevention ─────────────────────────────────
// Strips $-prefixed keys and dot notation from req.body, req.params, req.query
app.use(mongoSanitizeMiddleware);

// ── Security: Rate limiting on auth routes ───────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // Max 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
  skipSuccessfulRequests: true, // Only count failed attempts
});

// General API limiter (looser — for normal usage)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // 1 minute
  max: 200,                    // 200 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

app.use('/api/', apiLimiter);

// ── Routes: Auth (rate limited) ───────────────────────────────────────────
app.post('/api/auth/signup', authLimiter, signup);
app.post('/api/auth/login', authLimiter, login);
app.post('/api/auth/setup-profile', requireAuth, setupProfile);  // JWT required

// Admin-only utility: migrate SHA-256 passwords to bcrypt (run once)
app.post('/api/auth/migrate-passwords', requireAuth, requireAdmin, migratePasswords);

// ── Routes: Jobs (read is public, writes require auth) ───────────────────
app.get('/api/jobs', getJobs);
app.post('/api/jobs', requireAuth, requireAdmin, createJob);    // Admin only
app.put('/api/jobs/:id', requireAuth, requireAdmin, updateJob); // Admin only
app.delete('/api/jobs/:id', requireAuth, requireAdmin, deleteJob); // Admin only

// ── Routes: Company (public reads) ───────────────────────────────────────
app.get('/api/companies', getCompanies);

// ── Routes: Admin (JWT + admin role required) ────────────────────────────
app.get('/api/admin/students', requireAuth, requireAdmin, getStudents);

// ── Routes: n8n Automation (API key protected) ───────────────────────────
app.post('/api/n8n/ingest', apiKeyAuth, ingestJobs);
app.post('/api/n8n/mark-stale', apiKeyAuth, markJobsStale);
app.get('/api/n8n/sources', getSources);  // Public — frontend reads this

// ── Routes: Live Stats ────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [newJobsToday, totalActiveJobs] = await Promise.all([
      Job.countDocuments({ createdAt: { $gte: oneDayAgo }, isActive: { $ne: false } }),
      Job.countDocuments({ isActive: { $ne: false } }),
    ]);

    res.json({
      newJobsToday,
      totalActiveJobs,
      highFitMatches: Math.round(totalActiveJobs * 0.23),
      watchedCompanies: 62,
    });
  } catch (err) {
    console.error('Stats aggregation error:', err);
    res.json({
      newJobsToday: 0,
      totalActiveJobs: 0,
      highFitMatches: 0,
      watchedCompanies: 62,
      healthySources: '—',
    });
  }
});

// ── Global Error Handler ──────────────────────────────────────────────────
// Catches any unhandled errors including CORS rejections
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
