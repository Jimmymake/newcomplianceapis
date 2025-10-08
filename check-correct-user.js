import mongoose from 'mongoose';
import User from './models/User.js';
import Company from './models/Companyschema.js';
import UboInfo from './models/ubomodel.js';
import paymentinformodel from './models/paymentinformodel.js';
import settlementbankdetails from './models/settlementbankdetails.js';
import ComplianceRiskManagement from './models/riskmanagement.js';
import KycDocs from './models/kycdocs.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkCorrectUser() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchantdb';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // The token shows this user info:
    // fullname: "Jimmy Barasa"
    // email: "barasajimmy699@gmail.com" 
    // merchantId: "MIDd7MVC7tSPOPwt2HBamU6"

    const merchantid = "MIDd7MVC7tSPOPwt2HBamU6";
    const email = "barasajimmy699@gmail.com";

    console.log(`\n🔍 Checking the CORRECT user from your token:`);
    console.log(`   Email: ${email}`);
    console.log(`   Merchant ID: ${merchantid}\n`);

    // Get user
    const user = await User.findOne({ merchantid });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 User: ${user.fullname} (${user.email})`);
    console.log(`📊 Onboarding Status: ${user.onboardingStatus}\n`);

    // Check each form's completion status
    const [company, ubo, payment, settlement, risk, kyc] = await Promise.all([
      Company.findOne({ merchantid }),
      UboInfo.findOne({ merchantid }),
      paymentinformodel.findOne({ merchantid }),
      settlementbankdetails.findOne({ merchantid }),
      ComplianceRiskManagement.findOne({ merchantid }),
      KycDocs.findOne({ merchantid })
    ]);

    const forms = [
      { name: 'Company Information', data: company, stepId: 1 },
      { name: 'UBO', data: ubo, stepId: 2 },
      { name: 'Payment & Processing', data: payment, stepId: 3 },
      { name: 'Settlement Bank Details', data: settlement, stepId: 4 },
      { name: 'Risk Management', data: risk, stepId: 5 },
      { name: 'KYC Documents', data: kyc, stepId: 6 }
    ];

    console.log('📋 Form Completion Status:');
    console.log('=' .repeat(50));

    let completedCount = 0;
    forms.forEach(form => {
      const hasData = !!form.data;
      const isCompleted = form.data?.completed || false;
      const statusIcon = isCompleted ? '✅' : (hasData ? '📄' : '❌');
      const statusText = isCompleted ? 'COMPLETED' : (hasData ? 'HAS DATA' : 'NO DATA');
      
      console.log(`${statusIcon} ${form.name}: ${statusText}`);
      if (hasData) {
        console.log(`   📅 Last Updated: ${form.data.updatedAt}`);
        console.log(`   🏷️  Completed Flag: ${form.data.completed}`);
      }
      console.log('');

      if (isCompleted) completedCount++;
    });

    console.log('=' .repeat(50));
    console.log(`📊 Summary: ${completedCount}/${forms.length} forms completed (${Math.round((completedCount/forms.length)*100)}%)`);

    // Check user's onboarding steps
    console.log('\n👤 User Onboarding Steps:');
    console.log(JSON.stringify(user.onboardingSteps, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkCorrectUser();









