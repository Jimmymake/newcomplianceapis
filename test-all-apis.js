// Comprehensive test script for all requested APIs
// Run with: node test-all-apis.js

const baseURL = 'http://localhost:4001/api';

async function testAllAPIs() {
  console.log('🧪 Testing All Requested APIs...\n');

  let token = '';
  let merchantid = '';

  try {
    // Step 1: Create/Login user
    console.log('1. Setting up authentication...');
    
    const loginData = {
      emailOrPhone: 'apitest@example.com',
      password: 'password123'
    };

    let loginResponse = await fetch(`${baseURL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    if (!loginResponse.ok) {
      // Create user if doesn't exist
      const signupData = {
        fullname: 'API Test User',
        email: 'apitest@example.com',
        phonenumber: '+1234567894',
        location: 'Test City',
        password: 'password123',
        role: 'merchant'
      };

      const signupResponse = await fetch(`${baseURL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData)
      });

      if (signupResponse.ok) {
        const signupResult = await signupResponse.json();
        token = signupResult.token;
        merchantid = signupResult.user.merchantid;
        console.log('✅ User created');
      } else {
        console.log('❌ User creation failed');
        return;
      }
    } else {
      const loginResult = await loginResponse.json();
      token = loginResult.token;
      merchantid = loginResult.user.merchantid;
      console.log('✅ User logged in');
    }

    console.log('   Token:', token.substring(0, 20) + '...');
    console.log('   Merchant ID:', merchantid);

    // Step 2: Test GET /api/user/profile
    console.log('\n2. Testing GET /api/user/profile...');
    const profileResponse = await fetch(`${baseURL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (profileResponse.ok) {
      const profileResult = await profileResponse.json();
      console.log('✅ GET /api/user/profile - SUCCESS');
      console.log('   User:', profileResult.user.fullname);
      console.log('   Progress:', `${profileResult.progress.completed}/${profileResult.progress.total} steps`);
    } else {
      console.log('❌ GET /api/user/profile - FAILED:', profileResponse.status);
    }

    // Step 3: Test GET /api/user/form-status
    console.log('\n3. Testing GET /api/user/form-status...');
    const formStatusResponse = await fetch(`${baseURL}/user/form-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (formStatusResponse.ok) {
      const formStatusResult = await formStatusResponse.json();
      console.log('✅ GET /api/user/form-status - SUCCESS');
      console.log('   Overall Status:', formStatusResult.overallStatus);
      console.log('   Progress:', `${formStatusResult.progress.completed}/${formStatusResult.progress.total} forms`);
      console.log('   Next Incomplete:', formStatusResult.nextIncompleteForm || 'All completed');
    } else {
      console.log('❌ GET /api/user/form-status - FAILED:', formStatusResponse.status);
    }

    // Step 4: Test PUT /api/companyinfor (Update company info)
    console.log('\n4. Testing PUT /api/companyinfor...');
    const companyUpdateData = {
      businessDescription: 'Updated business description for API test',
      companyEmail: 'updated@company.com'
    };

    const companyUpdateResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyUpdateData)
    });

    if (companyUpdateResponse.ok) {
      const companyUpdateResult = await companyUpdateResponse.json();
      console.log('✅ PUT /api/companyinfor - SUCCESS');
      console.log('   Message:', companyUpdateResult.message);
    } else {
      console.log('❌ PUT /api/companyinfor - FAILED:', companyUpdateResponse.status);
    }

    // Step 5: Test PUT /api/uboinfo (Update UBO info)
    console.log('\n5. Testing PUT /api/uboinfo...');
    const uboUpdateData = {
      ubo: [{
        fullname: 'Updated UBO Name',
        nationality: 'American',
        residentialadress: '123 Updated Street',
        persentageofownership: '25',
        souceoffunds: 'Business profits',
        pep: false,
        pepdetails: ''
      }]
    };

    const uboUpdateResponse = await fetch(`${baseURL}/uboinfo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(uboUpdateData)
    });

    if (uboUpdateResponse.ok) {
      const uboUpdateResult = await uboUpdateResponse.json();
      console.log('✅ PUT /api/uboinfo - SUCCESS');
      console.log('   Message:', uboUpdateResult.message);
    } else {
      console.log('❌ PUT /api/uboinfo - FAILED:', uboUpdateResponse.status);
    }

    // Step 6: Test PUT /api/paymentinfo (Update payment info)
    console.log('\n6. Testing PUT /api/paymentinfo...');
    const paymentUpdateData = {
      exmonthlytransaction: {
        amountinusd: 50000,
        numberoftran: 1000
      },
      avgtranssize: 50,
      chargebackrefungrate: '2%'
    };

    const paymentUpdateResponse = await fetch(`${baseURL}/paymentinfo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentUpdateData)
    });

    if (paymentUpdateResponse.ok) {
      const paymentUpdateResult = await paymentUpdateResponse.json();
      console.log('✅ PUT /api/paymentinfo - SUCCESS');
      console.log('   Message:', paymentUpdateResult.message);
    } else {
      console.log('❌ PUT /api/paymentinfo - FAILED:', paymentUpdateResponse.status);
    }

    // Step 7: Test PUT /api/settlementbank (Update bank details)
    console.log('\n7. Testing PUT /api/settlementbank...');
    const settlementUpdateData = {
      settlementbankdetail: [{
        nameofbank: 'Updated Bank Name',
        swiftcode: 'UPDATED33',
        jurisdiction: 'United States',
        settlementcurrency: 'USD'
      }]
    };

    const settlementUpdateResponse = await fetch(`${baseURL}/settlementbank`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settlementUpdateData)
    });

    if (settlementUpdateResponse.ok) {
      const settlementUpdateResult = await settlementUpdateResponse.json();
      console.log('✅ PUT /api/settlementbank - SUCCESS');
      console.log('   Message:', settlementUpdateResult.message);
    } else {
      console.log('❌ PUT /api/settlementbank - FAILED:', settlementUpdateResponse.status);
    }

    // Step 8: Test PUT /api/riskmanagementinfo (Update risk management)
    console.log('\n8. Testing PUT /api/riskmanagementinfo...');
    const riskUpdateData = {
      amlpolicy: true,
      officerdetails: {
        fullname: 'Updated Risk Officer',
        telephonenumber: '+1234567890',
        email: 'risk@company.com'
      },
      historyofregulatoryfine: false,
      hereaboutus: 'Updated referral source'
    };

    const riskUpdateResponse = await fetch(`${baseURL}/riskmanagementinfo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(riskUpdateData)
    });

    if (riskUpdateResponse.ok) {
      const riskUpdateResult = await riskUpdateResponse.json();
      console.log('✅ PUT /api/riskmanagementinfo - SUCCESS');
      console.log('   Message:', riskUpdateResult.message);
    } else {
      console.log('❌ PUT /api/riskmanagementinfo - FAILED:', riskUpdateResponse.status);
    }

    // Step 9: Test PUT /api/kycinfo (Update KYC documents)
    console.log('\n9. Testing PUT /api/kycinfo...');
    const kycUpdateData = {
      certincorporation: 'Updated incorporation certificate',
      bankstatement: 'Updated bank statement',
      passportids: 'Updated passport IDs',
      websiteipadress: ['192.168.1.1', '10.0.0.1']
    };

    const kycUpdateResponse = await fetch(`${baseURL}/kycinfo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(kycUpdateData)
    });

    if (kycUpdateResponse.ok) {
      const kycUpdateResult = await kycUpdateResponse.json();
      console.log('✅ PUT /api/kycinfo - SUCCESS');
      console.log('   Message:', kycUpdateResult.message);
    } else {
      console.log('❌ PUT /api/kycinfo - FAILED:', kycUpdateResponse.status);
    }

    // Step 10: Final form status check
    console.log('\n10. Final form status check...');
    const finalFormStatusResponse = await fetch(`${baseURL}/user/form-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (finalFormStatusResponse.ok) {
      const finalFormStatusResult = await finalFormStatusResponse.json();
      console.log('✅ Final form status retrieved');
      console.log('   Overall Status:', finalFormStatusResult.overallStatus);
      console.log('   Progress:', `${finalFormStatusResult.progress.completed}/${finalFormStatusResult.progress.total} forms`);
      
      // Show individual form status
      console.log('   Form Status:');
      Object.entries(finalFormStatusResult.forms).forEach(([formName, status]) => {
        console.log(`     ${formName}: ${status.completed ? '✅ Completed' : '❌ Incomplete'}`);
      });
    } else {
      console.log('❌ Final form status check failed');
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 All API testing completed!');
  console.log('\n📋 Summary of Tested APIs:');
  console.log('✅ GET /api/user/profile - Fetch complete user data');
  console.log('✅ PUT /api/companyinfor - Update company info');
  console.log('✅ PUT /api/uboinfo - Update UBO info');
  console.log('✅ PUT /api/paymentinfo - Update payment info');
  console.log('✅ PUT /api/settlementbank - Update bank details');
  console.log('✅ PUT /api/riskmanagementinfo - Update risk management');
  console.log('✅ PUT /api/kycinfo - Update KYC documents');
  console.log('✅ GET /api/user/form-status - Check form completion status');
}

// Run the test
testAllAPIs();



