import mongoose from 'mongoose';
import User from './models/User.js';
import { nanoid } from 'nanoid';

// Test script to verify merchant ID timestamp functionality
async function testMerchantTimestamp() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/compliance-api');
    console.log('✅ Connected to MongoDB');

    // Test creating a new user with merchant ID timestamp
    const testUser = new User({
      fullname: 'Test User',
      email: `test-${nanoid(10)}@example.com`,
      phonenumber: `+123456789${Math.floor(Math.random() * 1000)}`,
      location: 'Test Location',
      password: 'hashedpassword',
      role: 'merchant',
      merchantid: 'MID' + nanoid(20),
      merchantIdAssignedAt: new Date()
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📋 User details:');
    console.log(`   - Merchant ID: ${testUser.merchantid}`);
    console.log(`   - Merchant ID Assigned At: ${testUser.merchantIdAssignedAt}`);
    console.log(`   - Created At: ${testUser.createdAt}`);
    console.log(`   - Updated At: ${testUser.updatedAt}`);

    // Verify the timestamp is properly set
    if (testUser.merchantIdAssignedAt) {
      console.log('✅ Merchant ID timestamp is properly set');
    } else {
      console.log('❌ Merchant ID timestamp is missing');
    }

    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testMerchantTimestamp();

