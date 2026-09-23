const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4003;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4002';

let orders = [];
let nextId = 1;

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'order-service' }));

app.get('/orders', (req, res) => res.json(orders));

// Creates an order, verifying the user exists and reserving product stock.
// This is the interesting bit to practice: one request fanning out to two
// other services over the network.
app.post('/orders', async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body || {};
  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId required' });
  }

  try {
    const userResp = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
    const productResp = await axios.post(
      `${PRODUCT_SERVICE_URL}/products/${productId}/reserve`,
      { quantity }
    );

    const order = {
      id: nextId++,
      user: userResp.data,
      product: productResp.data,
      quantity,
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    res.status(201).json(order);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ error: err.response.data.error || 'Upstream error' });
    }
    console.error(err.message);
    res.status(502).json({ error: 'A dependent service is unavailable' });
  }
});

app.listen(PORT, () => console.log(`Order service listening on ${PORT}`));
