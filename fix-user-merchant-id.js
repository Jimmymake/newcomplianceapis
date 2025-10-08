import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixUserMerchantId() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchantdb';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // The correct user from your token
    const targetUserId = "68dabc3852e1e37117e7df5f"; // Jimmy Barasa
    const targetEmail = "barasajimmy699@gmail.com";

    console.log(`\n🔧 Fixing merchant ID for user: Jimmy Barasa (${targetEmail})\n`);

    // Get the user
    const user = await User.findById(targetUserId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 Current User: ${user.fullname} (${user.email})`);
    console.log(`🏷️  Current Merchant ID: ${user.merchantid}`);

    // Generate a new unique merchant ID
    const newMerchantId = "MID" + nanoid(20);
    console.log(`🆕 New Merchant ID: ${newMerchantId}`);

    // Update the user with the new merchant ID
    user.merchantid = newMerchantId;
    await user.save();

    console.log('✅ User updated with new merchant ID');

    // Verify the update
    const updatedUser = await User.findById(targetUserId);
    console.log(`\n🔍 Verification:`);
    console.log(`   Name: ${updatedUser.fullname}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New Merchant ID: ${updatedUser.merchantid}`);
    console.log(`   Onboarding Status: ${updatedUser.onboardingStatus}`);

    console.log('\n📋 User Onboarding Steps (should all be false now):');
    console.log(JSON.stringify(updatedUser.onboardingSteps, null, 2));

    console.log('\n🎉 SUCCESS!');
    console.log('Your user now has a unique merchant ID and will show correct form status.');
    console.log('All forms should now show as "not completed" since you haven\'t filled them out yet.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixUserMerchantId();









