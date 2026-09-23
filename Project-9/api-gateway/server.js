const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

const PORT = process.env.PORT || 4000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:4003';

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Simple path-based routing, the same pattern real gateways (Kong, nginx,
// an Ingress controller) use: /api/<service> -> that service's root.
app.use('/api/users', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/api/users': '/users' } }));
app.use('/api/products', createProxyMiddleware({ target: PRODUCT_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/api/products': '/products' } }));
app.use('/api/orders', createProxyMiddleware({ target: ORDER_SERVICE_URL, changeOrigin: true, pathRewrite: { '^/api/orders': '/orders' } }));

app.listen(PORT, () => console.log(`API gateway listening on ${PORT}`));
