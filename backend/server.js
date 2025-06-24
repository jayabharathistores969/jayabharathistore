// Vercel deployment fix - ensuring all routes are properly loaded
// Version: 1.0.1 - Fixed logger for serverless environment
const express = require('express');
const mongoose = require('mongoose');

// Load environment variables first
try {
  require('dotenv').config({ path: './temp.env' });
} catch (error) {
  // If temp.env doesn't exist, try loading from .env or use environment variables
  require('dotenv').config();
}

// Dependencies
const cors = require('cors');
const helmet = require('helmet');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { apiLimiter } = require('./middleware/auth');
const { logger } = require('./utils/logger');
const { exec } = require('child_process');

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI', 'JWT_SECRET', 'NODE_ENV',
  'BREVO_API_KEY', 'EMAIL_USER', 'EMAIL_PASSWORD', 'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  if (!process.env.VERCEL) {
    process.exit(1);
  } else {
    console.warn('Running on Vercel - some environment variables may be missing but continuing...');
  }
}

// Log non-sensitive environment info
console.log('Environment loaded:\n------------------');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 'Not set');
console.log('Email Config:', process.env.EMAIL_USER || 'Not set');
console.log('Brevo API Key Length:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.length : 'Not set');
console.log('------------------');

const app = express();

// Security middleware
app.use(helmet());

// DOMPurify for sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeInput = (data) => {
  if (data === null || typeof data !== 'object') return data;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
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

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://elaborate-torte-886d48.netlify.app',
  'https://www.jayabharathistore.xyz',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://localhost:3000',
  'https://localhost:3001'
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Import routes with detailed logging
console.log('Starting route imports...');

const authRoutes = require('./routes/auth');
console.log('authRoutes loaded:', typeof authRoutes, authRoutes instanceof require('express').Router);

const userRoutes = require('./routes/users');
console.log('userRoutes loaded:', typeof userRoutes, userRoutes instanceof require('express').Router);

const productRoutes = require('./routes/products');
console.log('productRoutes loaded:', typeof productRoutes, productRoutes instanceof require('express').Router);

const cartRoutes = require('./routes/cart');
console.log('cartRoutes loaded:', typeof cartRoutes, cartRoutes instanceof require('express').Router);

const orderRoutes = require('./routes/orders');
console.log('orderRoutes loaded:', typeof orderRoutes, orderRoutes instanceof require('express').Router);

const paymentRoutes = require('./routes/payment');
console.log('paymentRoutes loaded:', typeof paymentRoutes, paymentRoutes instanceof require('express').Router);

const adminRoutes = require('./routes/admin');
console.log('adminRoutes loaded:', typeof adminRoutes, adminRoutes instanceof require('express').Router);

const supportRoutes = require('./routes/support');
console.log('supportRoutes loaded:', typeof supportRoutes, supportRoutes instanceof require('express').Router);

console.log('All routes imported successfully');

// API routes with error handling
console.log('Registering routes...');

try {
  console.log('Registering auth routes...');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes registered successfully');
} catch (error) {
  console.error('Error registering auth routes:', error);
  throw error;
}

try {
  console.log('Registering user routes...');
  app.use('/api/users', userRoutes);
  console.log('User routes registered successfully');
} catch (error) {
  console.error('Error registering user routes:', error);
  throw error;
}

try {
  console.log('Registering product routes...');
  app.use('/api/products', productRoutes);
  console.log('Product routes registered successfully');
} catch (error) {
  console.error('Error registering product routes:', error);
  throw error;
}

try {
  console.log('Registering cart routes...');
  app.use('/api/cart', cartRoutes);
  console.log('Cart routes registered successfully');
} catch (error) {
  console.error('Error registering cart routes:', error);
  throw error;
}

try {
  console.log('Registering order routes...');
  app.use('/api/orders', orderRoutes);
  console.log('Order routes registered successfully');
} catch (error) {
  console.error('Error registering order routes:', error);
  throw error;
}

try {
  console.log('Registering payment routes...');
  app.use('/api/payment', paymentRoutes);
  console.log('Payment routes registered successfully');
} catch (error) {
  console.error('Error registering payment routes:', error);
  throw error;
}

try {
  console.log('Registering admin routes...');
  app.use('/api/admin', adminRoutes);
  console.log('Admin routes registered successfully');
} catch (error) {
  console.error('Error registering admin routes:', error);
  throw error;
}

try {
  console.log('Registering support routes...');
  app.use('/api/support', supportRoutes);
  console.log('Support routes registered successfully');
} catch (error) {
  console.error('Error registering support routes:', error);
  throw error;
}

try {
  console.log('Registering contact routes...');
  app.use('/api/contact', (req, res, next) => {
    if (req.method === 'POST') req.url = '/contact';
    next();
  }, supportRoutes);
  console.log('Contact routes registered successfully');
} catch (error) {
  console.error('Error registering contact routes:', error);
  throw error;
}

console.log('All routes registered successfully');

// Test route to verify server is working
app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler:', {
    error: err.message,
    stack: err.stack
  });
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'JayaBharathi Store API is running',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'JayaBharathi Store API',
    version: '1.0.1',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      payment: '/api/payment',
      admin: '/api/admin',
      support: '/api/support'
    }
  });
});

// Debug endpoint to check environment and CORS
app.get('/debug', (req, res) => {
  res.status(200).json({
    message: 'Debug Information',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      isVercel: !!process.env.VERCEL
    },
    cors: {
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin
    },
    timestamp: new Date().toISOString()
  });
});

// Kill port process utility
const killProcessOnPort = (port) => {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows
      ? `netstat -ano | findstr :${port} | findstr LISTENING`
      : `lsof -ti:${port}`;

    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) return resolve(); // No process found

      let pid = isWindows
        ? stdout.trim().split('\n')[0]?.trim().split(/\s+/).pop()
        : stdout.trim();

      if (!pid) return resolve();

      const killCommand = isWindows ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`;
      exec(killCommand, (killError) => {
        if (killError) {
          logger.warn(`Failed to kill process ${pid} on port ${port}: ${killError.message}`);
        } else {
          logger.info(`Killed process ${pid} on port ${port}`);
        }
        resolve();
      });
    });
  });
};

// Start server
const startServer = async (port) => {
  try {
    await killProcessOnPort(port);
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    logger.warn(`Error killing port ${port}: ${err.message}`);
  }

  const server = app.listen(port, () => {
    logger.info(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} already in use. Stop the other process.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
    }
  });
};

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    logger.info('Connected to MongoDB');
    console.log('Connected to MongoDB');
    
    // Only start server if not on Vercel (serverless environment)
    if (!process.env.VERCEL) {
      await startServer(5001);
    } else {
      console.log('Running on Vercel - server will be managed by Vercel');
    }
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Static assets in production (optional)
if (process.env.NODE_ENV === 'production') {
  // Add static serving logic if needed
}

module.exports = app;
