import mongoose from 'mongoose';
import UboInfo from './models/ubomodel.js';
import paymentinformodel from './models/paymentinformodel.js';
import ComplianceRiskManagement from './models/riskmanagement.js';
import KycDocs from './models/kycdocs.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixRemainingForms() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchantdb';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const merchantid = "MIDd7MVC7tSPOPwt2HBamU6";

    console.log(`\n🔧 Fixing remaining forms for merchant: ${merchantid}\n`);

    // Fix UBO form
    console.log('1. Fixing UBO form...');
    const ubo = await UboInfo.findOneAndUpdate(
      { merchantid },
      { completed: true },
      { new: true }
    );
    if (ubo) {
      console.log('✅ UBO form marked as completed');
    }

    // Fix Payment form
    console.log('2. Fixing Payment form...');
    const payment = await paymentinformodel.findOneAndUpdate(
      { merchantid },
      { completed: true },
      { new: true }
    );
    if (payment) {
      console.log('✅ Payment form marked as completed');
    }

    // Fix Risk Management form
    console.log('3. Fixing Risk Management form...');
    const risk = await ComplianceRiskManagement.findOneAndUpdate(
      { merchantid },
      { completed: true },
      { new: true }
    );
    if (risk) {
      console.log('✅ Risk Management form marked as completed');
    }

    // Fix KYC form
    console.log('4. Fixing KYC form...');
    const kyc = await KycDocs.findOneAndUpdate(
      { merchantid },
      { completed: true },
      { new: true }
    );
    if (kyc) {
      console.log('✅ KYC form marked as completed');
    }

    // Update User's onboarding steps to match
    console.log('\n5. Updating User onboarding steps...');
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.ubo.completed = true;
      user.onboardingSteps.paymentandprosessing.completed = true;
      user.onboardingSteps.riskmanagement.completed = true;
      user.onboardingSteps.kycdocs.completed = true;
      await user.save();
      console.log('✅ User onboarding steps updated');
    }

    console.log('\n🎉 All forms have been fixed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixRemainingForms();










