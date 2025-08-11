const mongoose = require('mongoose');
const UsersModel = require('../model/UsersModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paybridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdminUser = async () => {
  try {
    console.log('🔍 Checking for existing users...');
    
    // Find all users
    const users = await UsersModel.find({});
    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Role: ${user.role}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user account first through the app.');
      return;
    }
    
    // Ask which user to make admin
    const userEmail = process.argv[2];
    
    if (!userEmail) {
      console.log('\n💡 To make a user admin, run:');
      console.log('   node scripts/createAdmin.js user@email.com');
      console.log('\n📋 Available users:');
      users.forEach(user => {
        console.log(`   - ${user.email}`);
      });
      return;
    }
    
    // Find the user by email
    const user = await UsersModel.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ User with email ${userEmail} not found.`);
      return;
    }
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ Successfully made ${user.name} (${user.email}) an admin!`);
    console.log(`🔐 User ${user.email} now has admin role and can access the admin panel.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();
