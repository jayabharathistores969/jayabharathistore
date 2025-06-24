// Trigger Vercel redeploy for CORS fix
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { apiLimiter } = require('./middleware/auth');
const { logger } = require('./utils/logger');
const { exec } = require('child_process');

// Load environment variables
try {
  require('dotenv').config({ path: './temp.env' });
} catch {
  require('dotenv').config();
}

const requiredEnvVars = [
  'MONGODB_URI', 'JWT_SECRET', 'NODE_ENV',
  'BREVO_API_KEY', 'EMAIL_USER', 'EMAIL_PASSWORD', 'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);
if (missingEnvVars.length > 0) {
  console.error('Missing required env vars:', missingEnvVars.join(', '));
  if (!process.env.VERCEL) process.exit(1);
}

console.log('Environment loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 'Not set');
console.log('Email Config:', process.env.EMAIL_USER || 'Not set');
console.log('Brevo API Key Length:', process.env.BREVO_API_KEY?.length || 'Not set');

const app = express();

// Security middleware
app.use(helmet());

// DOMPurify for input sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeInput = (data) => {
  if (data === null || typeof data !== 'object') return data;
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const value = data[key];
      data[key] = typeof value === 'string' ? DOMPurify.sanitize(value) : sanitizeInput(value);
    }
  }
  return data;
};

app.use((req, res, next) => {
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// CORS setup - MUST be at the very top before any routes or middleware
const allowedOrigins = [
  'https://elaborate-torte-886d48.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://jayabharathistore.xyz',
  'https://www.jayabharathistore.xyz'
];

app.use((req, res, next) => {
  console.log('CORS check for origin:', req.headers.origin);
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) {
      console.log('No origin provided, allowing request');
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      return callback(null, true);
    }
    console.log('Origin blocked:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add preflight handler for OPTIONS requests
app.options('*', cors());

// Debug incoming requests (for CORS/auth troubleshooting)
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  console.log(`[DEBUG] Origin: ${req.headers.origin}`);
  console.log(`[DEBUG] Authorization: ${req.headers.authorization}`);
  next();
});

// Route Imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const supportRoutes = require('./routes/support');

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Test Routes
app.get('/test', (req, res) => res.json({ message: 'Server is working!', timestamp: new Date().toISOString() }));
app.get('/api/test-cors', (req, res) => res.json({ message: 'CORS is working!', origin: req.headers.origin }));
app.get('/cors-test', (req, res) => res.json({ message: 'CORS test successful', origin: req.headers.origin }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.json({ message: 'JayaBharathi Store API is running', status: 'ok' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// MongoDB Connection
const connectToMongoDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MongoDB URI not set.');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    if (!process.env.VERCEL) process.exit(1);
    return false;
  }
};

// Kill any existing server on the same port (local dev only)
const killProcessOnPort = (port) => {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32'
      ? `netstat -ano | findstr :${port} | findstr LISTENING`
      : `lsof -ti:${port}`;
    exec(cmd, (error, stdout) => {
      if (error || !stdout.trim()) return resolve();
      const pid = process.platform === 'win32' ? stdout.trim().split(/\s+/).pop() : stdout.trim();
      exec(process.platform === 'win32' ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`, () => resolve());
    });
  });
};

// Start Server
const startServer = async (port) => {
  await killProcessOnPort(port);
  setTimeout(() => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port} (${process.env.NODE_ENV})`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} in use`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
      }
    });
  }, 1000);
};

// Initialize
(async () => {
  const connected = await connectToMongoDB();
  if (!process.env.VERCEL) await startServer(process.env.PORT || 5001);
  else console.log('Vercel environment: serverless functions used');
})();

module.exports = app;
