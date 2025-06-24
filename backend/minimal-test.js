const express = require('express');
const cors = require('cors');

const app = express();

// Simple CORS setup
app.use(cors({
  origin: ['https://elaborate-torte-886d48.netlify.app'],
  credentials: true
}));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test server is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Products test endpoint
app.get('/api/products', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Test Product',
      price: 99.99,
      description: 'This is a test product'
    }
  ]);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Test server is running',
    status: 'ok'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});

module.exports = app; 