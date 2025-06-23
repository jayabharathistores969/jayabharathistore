const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { auth } = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // Amount in paisa
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

// Verify Payment and Create Order
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    const userId = req.user.id;

    // 1. Verify the signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // 2. Fetch user's cart to create the order
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // 3. Calculate total amount and validate stock from the cart
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isAvailable || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${product.name} is out of stock or unavailable.`,
        });
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // 4. Create the order in your database
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentStatus: 'paid',
      paymentDetails: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
    });

    await newOrder.save();
    
    // 5. Clear the user's cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    
    res.status(201).json({ 
        message: 'Payment verified and order created successfully',
        orderId: newOrder._id 
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Internal Server Error during payment verification' });
  }
});

module.exports = router; 