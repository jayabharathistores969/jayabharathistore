const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { logger } = require('../utils/logger');
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET;
const pendingRegistrations = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email using Brevo API directly
async function sendOTPEmail(email, otp) {
  const url = 'https://api.brevo.com/v3/smtp/email';
  const options = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: "JayaBharathi Store",
        email: process.env.EMAIL_USER
      },
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent: `<p>Your OTP is <b>${otp}</b>. Do not share it with anyone.</p>`
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      console.error('Brevo API error:', data);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Register a new user

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password +active');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(403).json({ message: 'This account has been deactivated. Please contact support.' });
    }
    
    // Prevent login if user is not verified
    if (user.isVerified === false) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Send OTP Route
router.post('/send-otp', async (req, res) => {
  try {
    console.log("Incoming request:", req.body);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }
    // Generate OTP
    const otp = generateOTP();
    console.log("Generated OTP:", otp);
    // Save OTP to user
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();
    // Send OTP via Brevo API
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("❌ Internal Server Error in send-otp:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

// Verify OTP and Reset Password Route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update user password and clear OTP (let pre-save hook hash it)
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Test Email Configuration Route (Development Only)
router.post('/test-email-config', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'This route is only available in development mode' });
  }

  try {
    logger.info('Testing Brevo API configuration');
    
    // Check if API key is set
    if (!process.env.BREVO_API_KEY) {
      logger.error('Brevo API key is not set');
      return res.status(500).json({ message: 'Brevo API key is not configured' });
    }

    // Test API key format
    if (!process.env.BREVO_API_KEY.startsWith('xsmtpsib-')) {
      logger.error('Invalid Brevo API key format');
      return res.status(500).json({ message: 'Invalid Brevo API key format' });
    }

    // Make a test API call
    const url = 'https://api.sendinblue.com/v3/account';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      }
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('Brevo API test failed:', data);
      return res.status(500).json({
        message: 'Failed to connect to Brevo API',
        error: data
      });
    }

    logger.info('Brevo API test successful');
    res.json({
      message: 'Brevo API configuration is valid',
      accountDetails: {
        email: data.email,
        companyName: data.companyName,
        plan: data.plan
      }
    });
  } catch (error) {
    logger.error('Error testing Brevo configuration:', error);
    res.status(500).json({
      message: 'Error testing email configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Registration: Send OTP
router.post('/register/send-otp', async (req, res) => {
  try {
    const { email, name, password, phone } = req.body;
    if (!email || !name || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 600000; // 10 min
    // Store pending registration
    pendingRegistrations.set(email, { name, email, password, phone, otp, expires });
    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) throw new Error('Failed to send OTP email');
    res.json({ message: 'OTP sent to your email. Please verify to complete registration.' });
  } catch (err) {
    console.error('Register send-otp error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Registration: Verify OTP
router.post('/register/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pending = pendingRegistrations.get(email);
    if (!pending || pending.otp !== otp || pending.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Create user in DB
    const user = new User({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      phone: pending.phone,
      isVerified: true
    });
    await user.save();
    pendingRegistrations.delete(email);
    res.json({ message: 'Registration complete! You can now log in.' });
  } catch (err) {
    console.error('Register verify-otp error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 