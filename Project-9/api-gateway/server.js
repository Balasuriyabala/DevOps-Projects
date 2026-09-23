const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5050;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5002';

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// The browser only ever talks to the gateway. It has no idea auth-service
// and user-service exist as separate processes.
app.use('/api/auth', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/api/auth': '' } }));
app.use('/api/users', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/api/users': '/users' } }));

app.listen(PORT, () => console.log(`API gateway listening on ${PORT}`));
