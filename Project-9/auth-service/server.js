const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 6001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:6002';

// auth-service owns ONLY credentials. It never stores profile info.
let credentials = [];
let nextId = 1;

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  if (credentials.find(c => c.username === username)) {
    return res.status(409).json({ error: 'username already taken' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = nextId++;
  credentials.push({ id, username, passwordHash });

  // Service-to-service call, this time in the OTHER direction from the
  // order demo: auth-service is the caller, user-service just records
  // what it's told. This is how registration creates a public profile
  // in a completely separate service.
  try {
    await axios.post(`${USER_SERVICE_URL}/internal/users`, { id, username });
  } catch (err) {
    // Keep the two services from drifting out of sync if the profile
    // couldn't be created.
    credentials = credentials.filter(c => c.id !== id);
    return res.status(502).json({ error: 'Could not create user profile' });
  }

  res.status(201).json({ id, username });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = credentials.find(c => c.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

  // The token is signed with a secret ONLY auth-service and user-service
  // know (JWT_SECRET). Anything holding this token can prove who it is
  // to any service that shares the secret, with no extra network call.
  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, username: user.username });
});

app.listen(PORT, () => console.log(`Auth service listening on ${PORT}`));

