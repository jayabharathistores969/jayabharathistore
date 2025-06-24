const mongoose = require('mongoose');
const Product = require('./models/Product');
const { ObjectId } = require('mongodb');
require('dotenv').config({ path: './temp.env' });

const products = [
  {
    _id: '64e2b1c2f1a2b3c4d5e6f701',
    name: 'Rice',
    description: 'High quality rice',
    price: 50,
    category: 'Groceries',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'kg',
    rating: 0,
  },
  {
    _id: '64e2b1c2f1a2b3c4d5e6f702',
    name: 'Dal',
    description: 'Premium dal',
    price: 40,
    category: 'Groceries',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'kg',
    rating: 0,
  },
  {
    _id: '64e2b1c2f1a2b3c4d5e6f703',
    name: 'Soap',
    description: 'Gentle soap for skin',
    price: 20,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'piece',
    rating: 0,
  },
  {
    _id: "64e2b1c2f1a2b3c4d5e6f704",
    name: 'Detergent',
    description: 'Effective detergent',
    price: 30,
    category: 'Household',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'kg',
    rating: 0,
  },
  {
    _id: '64e2b1c2f1a2b3c4d5e6f705',
    name: 'Tea',
    description: 'Refreshing tea',
    price: 25,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'g',
    rating: 0,
  },
  {
    _id: '64e2b1c2f1a2b3c4d5e6f706',
    name: 'Biscuits',
    description: 'Tasty biscuits',
    price: 15,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'g',
    rating: 0,
  },
  {
    _id: '64e2b1c2f1a2b3c4d5e6f707',
    name: 'Oil',
    description: 'Pure cooking oil',
    price: 60,
    category: 'Groceries',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'l',
    rating: 0,
  },
  {
    _id: '64e2b1c2f1a2b3c4d5e6f708',
    name: 'Shampoo',
    description: 'Nourishing shampoo',
    price: 35,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'ml',
    rating: 0,
  },
  {
    _id: '64e2b1c2f1a2b3c4d5e6f709',
    name: 'Coffee',
    description: 'Aromatic coffee',
    price: 45,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'g',
    rating: 0,
  },
  {
    _id: '64e2b1c2f1a2b3c4d5e6f70a',
    name: 'Chips',
    description: 'Crunchy chips',
    price: 10,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    unit: 'g',
    rating: 0,
  },
];

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Products seeded!');
    process.exit();
  })
  .catch(err => {
    console.error('Error seeding products:', err);
    process.exit(1);
  });
