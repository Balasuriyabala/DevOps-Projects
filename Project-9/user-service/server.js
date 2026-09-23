const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// user-service owns ONLY public profile data. It has never seen a password.
let profiles = [];

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'user-service' }));

// Internal endpoint - only auth-service should call this. In production
// you'd lock this down (private network, mTLS, an internal-only ingress
// rule) rather than trust it just because it's not on the public gateway.
app.post('/internal/users', (req, res) => {
  const { id, username } = req.body || {};
  if (!id || !username) return res.status(400).json({ error: 'id and username required' });
  profiles.push({ id, username, joinedAt: new Date().toISOString() });
  res.status(201).json({ id, username });
});

// Verifies the JWT itself with the SAME secret auth-service signed it
// with. No network call back to auth-service needed - this is the whole
// point of stateless JWTs.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/users', requireAuth, (req, res) => {
  res.json(profiles.map(({ id, username, joinedAt }) => ({ id, username, joinedAt })));
});

app.listen(PORT, () => console.log(`User service listening on ${PORT}`));
