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

async function verifyFixedUser() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchantdb';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // The fixed user
    const targetUserId = "68dabc3852e1e37117e7df5f"; // Jimmy Barasa
    const newMerchantId = "MIDW5I9QZQQPVdB351f3OI2";

    console.log(`\n🔍 Verifying fixed user: Jimmy Barasa (barasajimmy699@gmail.com)\n`);

    // Get the user
    const user = await User.findById(targetUserId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 User: ${user.fullname} (${user.email})`);
    console.log(`🏷️  Merchant ID: ${user.merchantid}`);
    console.log(`📊 Onboarding Status: ${user.onboardingStatus}\n`);

    // Check each form's completion status with the NEW merchant ID
    const [company, ubo, payment, settlement, risk, kyc] = await Promise.all([
      Company.findOne({ merchantid: newMerchantId }),
      UboInfo.findOne({ merchantid: newMerchantId }),
      paymentinformodel.findOne({ merchantid: newMerchantId }),
      settlementbankdetails.findOne({ merchantid: newMerchantId }),
      ComplianceRiskManagement.findOne({ merchantid: newMerchantId }),
      KycDocs.findOne({ merchantid: newMerchantId })
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

    if (completedCount === 0) {
      console.log('\n🎉 PERFECT! Your user now shows the correct status:');
      console.log('   ✅ No forms are marked as completed');
      console.log('   ✅ All forms show as "NO DATA"');
      console.log('   ✅ This matches your actual form completion status');
    } else {
      console.log('\n⚠️  There are still some forms marked as completed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyFixedUser();







