const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not set in .env. Refusing to start without it.');
  process.exit(1);
}

/**
 * requireAuth middleware
 * Validates the Bearer JWT token in the Authorization header.
 * Attaches decoded user payload to req.user on success.
 *
 * Usage: app.get('/protected', requireAuth, handler)
 */
exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Malformed authorization header.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

/**
 * requireAdmin middleware
 * Must be chained AFTER requireAuth.
 * Rejects users whose JWT role is not 'admin'.
 *
 * Usage: app.get('/admin-only', requireAuth, requireAdmin, handler)
 */
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

/**
 * Helper: sign a JWT for a given user payload.
 * Non-expiring session: token does not expire automatically.
 * @param {{ id, email, role, name }} payload
 */
exports.signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET);
};
