// Load environment variables first
require('dotenv').config({ path: './temp.env' });

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV',
  'BREVO_API_KEY',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Log environment status (without sensitive data)
console.log('Environment loaded:');
console.log('------------------');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('Email Config:', process.env.EMAIL_USER);
console.log('Brevo API Key Length:', process.env.BREVO_API_KEY.length);
console.log('------------------');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { apiLimiter } = require('./middleware/auth');
const { logger } = require('./utils/logger');
const { exec } = require('child_process');

const app = express();

// Security Middleware
app.use(helmet());

// Setup DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Custom XSS sanitization middleware
const sanitizeInput = (data) => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (typeof value === 'string') {
        data[key] = DOMPurify.sanitize(value);
      } else {
        sanitizeInput(value); // Recursively sanitize nested objects/arrays
      }
    }
  }
  return data;
};

app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = [
  'https://jayabharathistore.xyz',
  'https://www.jayabharathistore.xyz'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const supportRoutes = require('./routes/support');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/contact', (req, res, next) => {
  if (req.method === 'POST') {
    req.url = '/contact';
  }
  next();
}, require('./routes/support'));

// Error handling middleware
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

// Function to kill process on port 5000
const killProcessOnPort = (port) => {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `netstat -ano | findstr :${port} | findstr LISTENING`
      : `lsof -ti:${port}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error || !stdout.trim()) {
        // No process found on port, which is fine
        resolve();
        return;
      }
      
      let pid;
      if (isWindows) {
        // Extract PID from Windows netstat output
        const lines = stdout.trim().split('\n');
        if (lines.length > 0) {
          const parts = lines[0].trim().split(/\s+/);
          pid = parts[parts.length - 1];
        }
      } else {
        // Unix systems - PID is directly output
        pid = stdout.trim();
      }
      
      if (pid) {
        const killCommand = isWindows ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`;
        exec(killCommand, (killError, killStdout, killStderr) => {
          if (killError) {
            logger.warn(`Failed to kill process ${pid} on port ${port}:`, killError.message);
            console.log(`Failed to kill process ${pid} on port ${port}:`, killError.message);
          } else {
            logger.info(`Killed process ${pid} on port ${port}`);
            console.log(`Killed process ${pid} on port ${port}`);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
};

const startServer = async (port) => {
  // Always kill any existing process on port 5000 before starting
  try {
    await killProcessOnPort(5000);
    // Wait a moment for the port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    logger.warn('Error killing process on port 5000:', error.message);
    console.log('Error killing process on port 5000:', error.message);
  }
  
  // Always use port 5001 and kill any existing process on it
  const targetPort = 5001;
  
  try {
    await killProcessOnPort(targetPort);
    // Wait a moment for the port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    logger.warn(`Error killing process on port ${targetPort}:`, error.message);
    console.log(`Error killing process on port ${targetPort}:`, error.message);
  }
  
  const server = app.listen(targetPort, () => {
    logger.info(`Server running on port ${targetPort} in ${process.env.NODE_ENV} mode`);
    console.log(`Server running on port ${targetPort} in ${process.env.NODE_ENV} mode`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${targetPort} is in use. Please stop the process using port ${targetPort} and try again.`);
      console.error(`Port ${targetPort} is in use. Please stop the process using port ${targetPort} and try again.`);
      process.exit(1);
    } else {
      logger.error('Server error:', err);
      console.error('Server error:', err);
    }
  });
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    logger.info('Connected to MongoDB');
    console.log('Connected to MongoDB');
    // Always use port 5001
    await startServer(5001);
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // ... existing code ...
} 