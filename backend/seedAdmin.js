const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './temp.env' });

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = 'jayabharathistores969@gmail.com';
  const password = 'Jayabharathi@2025';
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = new User({
      name: 'Admin',
      email,
      password,
      phone: '0000000000',
      role: 'admin',
      isVerified: true,
      active: true,
    });
    await admin.save();
    console.log('Admin user created.');
  } else {
    admin.role = 'admin';
    admin.isVerified = true;
    admin.active = true;
    admin.password = password; // Will be hashed by pre-save hook
    await admin.save();
    console.log('Admin user updated.');
  }
  mongoose.disconnect();
}

seedAdmin();
