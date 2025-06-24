// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Test endpoint to verify products route is working
router.get('/test', (req, res) => {
  console.log('Products test endpoint hit');
  res.status(200).json({ 
    message: 'Products route is working',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Simple products test endpoint (no database required)
router.get('/test-simple', (req, res) => {
  console.log('Simple products test endpoint hit');
  res.status(200).json([
    {
      _id: 'test1',
      name: 'Test Product 1',
      description: 'This is a test product',
      price: 99.99,
      category: 'Test',
      image: 'https://via.placeholder.com/300x200?text=Test1',
      stock: 10,
      isAvailable: true
    },
    {
      _id: 'test2',
      name: 'Test Product 2',
      description: 'Another test product',
      price: 149.99,
      category: 'Test',
      image: 'https://via.placeholder.com/300x200?text=Test2',
      stock: 5,
      isAvailable: true
    }
  ]);
});

// Debug endpoint to get all products (regardless of availability)
router.get('/debug', async (req, res) => {
  try {
    console.log('Products debug endpoint hit - fetching ALL products');
    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} total products`);
    console.log('All products:', allProducts.map(p => ({ id: p._id, name: p.name, isAvailable: p.isAvailable })));
    res.json({
      totalProducts: allProducts.length,
      availableProducts: allProducts.filter(p => p.isAvailable).length,
      products: allProducts
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ message: 'Error in debug endpoint', error: error.message });
  }
});

// Get products by category (placed before /:id to avoid route conflicts)
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isAvailable: true,
    });
    res.json(products);
  } catch (error) {
    console.error('[ERROR in GET /category/:category]:', error);
    res.status(500).json({ message: 'Error fetching products by category' });
  }
});

// Public: Get all available products
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/products hit');
    const products = await Product.find({ isAvailable: true });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Admin: Get all products regardless of availability
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('[ERROR in GET /all]:', error);
    res.status(500).json({ message: 'Error fetching all products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('[ERROR in GET /:id]:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create a new product (admin only)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('[ERROR in POST /]:', error);
    res.status(400).json({ message: 'Error creating product' });
  }
});

// Update a product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('[ERROR in PUT /:id]:', error);
    res.status(400).json({ message: 'Error updating product' });
  }
});

// Soft delete a product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isAvailable: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[ERROR in DELETE /:id]:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
