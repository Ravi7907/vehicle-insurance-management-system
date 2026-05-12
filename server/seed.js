const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const userExists = await User.findOne({ username: 'admin' });
    if (userExists) {
      console.log('⚠️ Admin user already exists');
      process.exit();
    }

    console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);

    // Delete existing admin if it exists
    await User.deleteMany({ username: 'admin' });
    console.log('🗑️  Cleared existing admin users');

    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
    });

    console.log('🚀 Default Admin User Created Successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding user:', error.message);
    process.exit(1);
  }
};

seedUser();
