const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4002;

let products = [
  { id: 1, name: 'Keyboard', price: 49.99, stock: 100 },
  { id: 2, name: 'Mouse', price: 19.99, stock: 200 },
  { id: 3, name: 'Monitor', price: 189.99, stock: 50 }
];

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'product-service' }));

app.get('/products', (req, res) => res.json(products));

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Decrement stock - used by order-service
app.post('/products/:id/reserve', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const qty = (req.body && req.body.quantity) || 1;
  if (product.stock < qty) return res.status(409).json({ error: 'Insufficient stock' });
  product.stock -= qty;
  res.json(product);
});

app.listen(PORT, () => console.log(`Product service listening on ${PORT}`));
