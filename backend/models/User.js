const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validatePassword } = require('../utils/passwordPolicy');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    min: 3,
    max: 255
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    max: 255
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password in queries
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  profileImage: {
    type: String,
    default: '',
  },
  addresses: [{
    fullName: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
    mobileNumber: { type: String, trim: true },
    isDefault: { type: Boolean, default: false }
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordOTP: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  lastLogin: Date,
  loginHistory: [{
    timestamp: Date,
    ip: String,
    userAgent: String,
    successful: Boolean
  }],
  registerOTP: {
    type: String,
  },
  registerOTPExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

// Password validation middleware
userSchema.pre('save', async function(next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  // Validate password
  const validation = validatePassword(this.password);
  if (!validation.isValid) {
    throw new Error(validation.errors[0]);
  }

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);
  this.lastPasswordChange = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

userSchema.methods.recordLoginAttempt = async function(success, ip, userAgent) {
  this.loginHistory.push({
    timestamp: new Date(),
    ip,
    userAgent,
    successful: success
  });

  if (success) {
    this.failedLoginAttempts = 0;
    this.lastLogin = new Date();
    this.lockUntil = undefined;
  } else {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.accountLocked = true;
      this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
  }

  await this.save();
};

// Keep only last 10 login attempts
userSchema.pre('save', function(next) {
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 