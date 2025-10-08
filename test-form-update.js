import mongoose from 'mongoose';
import Company from './models/Companyschema.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function testFormUpdate() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchantdb';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const merchantid = "MIDd7MVC7tSPOPwt2HBamU6";

    console.log(`\n🧪 Testing form update for merchant: ${merchantid}\n`);

    // Get current company info
    const currentCompany = await Company.findOne({ merchantid });
    console.log('📄 Current Company Info:');
    console.log(`   Company Name: ${currentCompany?.companyName || 'N/A'}`);
    console.log(`   Completed: ${currentCompany?.completed || false}`);
    console.log(`   Last Updated: ${currentCompany?.updatedAt || 'N/A'}\n`);

    // Update company info (simulating a form submission)
    const updateData = {
      companyName: currentCompany?.companyName || "Updated Test Company",
      companyEmail: "updated@testcompany.com",
      businessDescription: "Updated business description",
      licensingRequired: false,
      topCountries: ["United States", "Canada", "United Kingdom"]
    };

    console.log('🔄 Updating company info...');
    
    // Mark as completed when form is submitted with data
    updateData.completed = true;

    const updatedCompany = await Company.findOneAndUpdate(
      { merchantid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      console.log('❌ Company information not found');
      return;
    }

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.companyinformation.completed = true;
      if (updateData.companyName) {
        user.onboardingSteps.companyinformation.companyName = updateData.companyName;
      }
      await user.save();
    }

    console.log('✅ Company info updated successfully!');
    console.log(`   Company Name: ${updatedCompany.companyName}`);
    console.log(`   Completed: ${updatedCompany.completed}`);
    console.log(`   Last Updated: ${updatedCompany.updatedAt}\n`);

    // Verify the update
    console.log('🔍 Verifying update...');
    const verifyCompany = await Company.findOne({ merchantid });
    const verifyUser = await User.findOne({ merchantid });
    
    console.log(`📄 Company Model - Completed: ${verifyCompany.completed}`);
    console.log(`👤 User Model - Company Step Completed: ${verifyUser.onboardingSteps.companyinformation.completed}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testFormUpdate();









