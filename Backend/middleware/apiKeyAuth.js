/**
 * API Key Authentication Middleware
 * Protects internal/automation endpoints (e.g. n8n webhook ingest).
 * The client must send the header: x-api-key: <N8N_API_KEY>
 */
module.exports = (req, res, next) => {
  const key = req.headers['x-api-key'];
  const validKey = process.env.N8N_API_KEY;

  if (!validKey) {
    console.error('[apiKeyAuth] N8N_API_KEY is not set in .env');
    return res.status(500).json({ error: 'Server misconfiguration: API key not configured.' });
  }

  if (!key || key !== validKey) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing API key.' });
  }

  next();
};
