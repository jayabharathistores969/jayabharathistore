const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Admin Login - This route is public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password +active');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }
    
    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ message: 'Account is inactive.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// All routes below require admin
router.use(auth, isAdmin);

// DASHBOARD STATS
// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find({ status: { $in: ['delivered', 'out_for_delivery'] } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get low stock products (stock <= 10)
    const lowStockProducts = await Product.find({ stock: { $lte: 10 }, isAvailable: true })
      .limit(10);
    
    // Calculate growth percentages (simplified - you can make this more sophisticated)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthOrders = await Order.countDocuments({ createdAt: { $gte: lastMonth } });
    const lastMonthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: lastMonth }, status: { $in: ['delivered', 'out_for_delivery'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const orderGrowth = orderCount > 0 ? ((lastMonthOrders / orderCount) * 100).toFixed(1) : 0;
    const revenueGrowth = totalRevenue > 0 ? ((lastMonthRevenue[0]?.total || 0) / totalRevenue * 100).toFixed(1) : 0;
    
    res.json({
      users: userCount,
      products: productCount,
      orders: orderCount,
      revenue: totalRevenue,
      userGrowth: 0, // You can implement user growth calculation
      productGrowth: 0, // You can implement product growth calculation
      orderGrowth: parseFloat(orderGrowth),
      revenueGrowth: parseFloat(revenueGrowth),
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// USERS
// Get all users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password +active');
  // Transform users to include isBanned field for frontend compatibility
  const transformedUsers = users.map(user => ({
    ...user.toObject(),
    isBanned: !user.active
  }));
  res.json(transformedUsers);
});
// Delete user
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});
// Promote/demote user
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  res.json(user);
});
// Promote user to admin
router.put('/users/:id/promote', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true }).select('+active');
  const transformedUser = {
    ...user.toObject(),
    isBanned: !user.active
  };
  res.json({ message: 'User promoted to admin', user: transformedUser });
});
// Demote admin to user
router.put('/users/:id/demote', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: 'user' }, { new: true }).select('+active');
  const transformedUser = {
    ...user.toObject(),
    isBanned: !user.active
  };
  res.json({ message: 'User demoted to user', user: transformedUser });
});
// Ban user
router.put('/users/:id/ban', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true }).select('+active');
  const transformedUser = {
    ...user.toObject(),
    isBanned: !user.active
  };
  res.json({ message: 'User banned', user: transformedUser });
});
// Unban user
router.put('/users/:id/unban', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: true }, { new: true }).select('+active');
  const transformedUser = {
    ...user.toObject(),
    isBanned: !user.active
  };
  res.json({ message: 'User unbanned', user: transformedUser });
});

// PRODUCTS
// Get all products
router.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});
// Create product
router.post('/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});
// Update product
router.put('/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});
// Update product stock
router.put('/products/:id/stock', async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
  res.json(product);
});
// Delete product
router.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

// ORDERS
// Get all orders
router.get('/orders', async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').populate('items.product');
  res.json(orders);
});
// Update order status
router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(order);
});
// Accept/reject order
router.put('/orders/:id/accept', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
  res.json(order);
});
router.put('/orders/:id/reject', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  res.json(order);
});

module.exports = router; 