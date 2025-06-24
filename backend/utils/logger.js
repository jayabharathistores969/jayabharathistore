const winston = require('winston');

const transports = [
  new winston.transports.Console()
];

// Check if we're in a serverless environment (Vercel, etc.)
const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';

// Only add file transport in development and non-serverless environments
if (process.env.NODE_ENV === 'development' && !isServerless) {
  try {
    const fs = require('fs');
    const path = require('path');
    const logDir = 'logs';
    
    // Only try to create logs directory if we're not in a serverless environment
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    transports.push(
      new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
    );
  } catch (error) {
    console.warn('Could not create logs directory, using console logging only:', error.message);
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports
});

// Create request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  next();
};

// Security event logger
const securityLogger = {
  loginAttempt: (email, success, ip) => {
    logger.info({
      event: 'login_attempt',
      email,
      success,
      ip,
      timestamp: new Date().toISOString(),
    });
  },
  passwordReset: (email, ip) => {
    logger.info({
      event: 'password_reset',
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },
  accountLocked: (email, reason, ip) => {
    logger.warn({
      event: 'account_locked',
      email,
      reason,
      ip,
      timestamp: new Date().toISOString(),
    });
  },
  suspiciousActivity: (type, details, ip) => {
    logger.warn({
      event: 'suspicious_activity',
      type,
      details,
      ip,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  logger,
  requestLogger,
  securityLogger
}; 