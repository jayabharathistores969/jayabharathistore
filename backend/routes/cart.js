const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Get current user's cart
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error('No user found in request:', req.user);
      return res.status(401).json({ message: 'Unauthorized: No user found in request.' });
    }
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      // If no cart, return an empty cart structure
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error('Error in GET /api/cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update quantity of a cart item
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (quantity <= 0) {
        cart.items.pull(item._id);
    } else {
        item.quantity = quantity;
    }
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove an item from the cart
router.delete('/:itemId', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// (Optional) Add an item to the cart

// Clear all items from the current user's cart
router.delete('/', auth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add item to cart (specific route for frontend)
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: No user found in request.' });
        }
        
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }
        
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }
        
        await cart.save();
        await cart.populate('items.product');
        
        res.json(cart);
    } catch (err) {
        console.error('Error in POST /api/cart/add:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Remove item from cart (specific route for frontend)

module.exports = router; 