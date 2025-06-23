const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

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