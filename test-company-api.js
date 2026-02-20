// Test script for Company Information APIs
// Run with: node test-company-api.js

const baseURL = 'http://localhost:4001/api';

async function testCompanyAPI() {
  console.log('🧪 Testing Company Information APIs...\n');

  let token = '';
  let merchantid = '';

  try {
    // Step 1: Create a test user
    console.log('1. Creating test user...');
    const signupData = {
      fullname: 'Test Company User',
      email: 'companytest@example.com',
      phonenumber: '+1234567891',
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
      console.log('✅ User created successfully');
      console.log('   Merchant ID:', merchantid);
    } else {
      console.log('❌ User creation failed:', signupResponse.status);
      const errorData = await signupResponse.json();
      console.log('   Error:', errorData.message);
      return;
    }

    // Step 2: Test creating company information
    console.log('\n2. Testing company information creation...');
    const companyData = {
      companyName: 'Test Company Ltd',
      merchantUrls: 'https://testcompany.com',
      dateOfIncorporation: '2020-01-15',
      incorporationNumber: 'INC123456',
      countryOfIncorporation: 'United States',
      companyEmail: 'info@testcompany.com',
      contactPerson: {
        fullName: 'John Doe',
        phone: '+1234567890',
        email: 'john@testcompany.com'
      },
      businessDescription: 'A test company for API testing',
      sourceOfFunds: 'Private investment',
      purpose: 'E-commerce platform',
      licensingRequired: true,
      licenseInfo: {
        licencenumber: 'LIC123456',
        licencetype: 'Business License',
        jurisdiction: 'California'
      },
      bankname: 'Test Bank',
      swiftcode: 'TESTUS33',
      targetCountries: [
        { region: 'North America', percent: 60 },
        { region: 'Europe', percent: 40 }
      ],
      topCountries: ['United States', 'Canada', 'United Kingdom'],
      previouslyUsedGateways: 'Stripe, PayPal'
    };

    const createResponse = await fetch(`${baseURL}/companyinfor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyData)
    });

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Company information created successfully');
      console.log('   Company ID:', createResult.company._id);
      console.log('   Onboarding updated:', createResult.onboardingUpdated);
    } else {
      console.log('❌ Company creation failed:', createResponse.status);
      const errorData = await createResponse.json();
      console.log('   Error:', errorData.message);
    }

    // Step 3: Test getting company information
    console.log('\n3. Testing get company information...');
    const getResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ Company information retrieved successfully');
      console.log('   Company Name:', getResult.company.companyName);
      console.log('   Step Completed:', getResult.stepCompleted);
    } else {
      console.log('❌ Get company failed:', getResponse.status);
    }

    // Step 4: Test updating company information
    console.log('\n4. Testing company information update...');
    const updateData = {
      businessDescription: 'Updated business description for testing',
      topCountries: ['United States', 'Canada', 'United Kingdom', 'Germany']
    };

    const updateResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Company information updated successfully');
      console.log('   Updated Description:', updateResult.company.businessDescription);
    } else {
      console.log('❌ Company update failed:', updateResponse.status);
    }

    // Step 5: Test marking as complete
    console.log('\n5. Testing mark as complete...');
    const completeResponse = await fetch(`${baseURL}/companyinfor/merchant/${merchantid}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ completed: true })
    });

    if (completeResponse.ok) {
      const completeResult = await completeResponse.json();
      console.log('✅ Company marked as complete');
      console.log('   Completed:', completeResult.company.completed);
    } else {
      console.log('❌ Mark complete failed:', completeResponse.status);
    }

    // Step 6: Test getting by merchant ID
    console.log('\n6. Testing get by merchant ID...');
    const getByMerchantResponse = await fetch(`${baseURL}/companyinfor/merchant/${merchantid}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getByMerchantResponse.ok) {
      const getByMerchantResult = await getByMerchantResponse.json();
      console.log('✅ Company retrieved by merchant ID');
      console.log('   Company Name:', getByMerchantResult.company.companyName);
    } else {
      console.log('❌ Get by merchant ID failed:', getByMerchantResponse.status);
    }

    // Step 7: Test dashboard overview to see updated progress
    console.log('\n7. Testing dashboard overview...');
    const dashboardResponse = await fetch(`${baseURL}/dashboard/overview`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (dashboardResponse.ok) {
      const dashboardResult = await dashboardResponse.json();
      console.log('✅ Dashboard overview retrieved');
      console.log('   Progress:', `${dashboardResult.progress.completed}/${dashboardResult.progress.total} steps`);
      console.log('   Company Step Completed:', dashboardResult.steps.companyinformation.completed);
    } else {
      console.log('❌ Dashboard overview failed:', dashboardResponse.status);
    }

    // Step 8: Test onboarding status
    console.log('\n8. Testing onboarding status...');
    const statusResponse = await fetch(`${baseURL}/onboarding/status/${merchantid}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (statusResponse.ok) {
      const statusResult = await statusResponse.json();
      console.log('✅ Onboarding status retrieved');
      console.log('   Overall Status:', statusResult.overallStatus);
      console.log('   Company Step:', statusResult.steps.companyinformation.completed);
    } else {
      console.log('❌ Onboarding status failed:', statusResponse.status);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Company API testing completed!');
  console.log('\n📋 Summary of Company Information API Endpoints:');
  console.log('   POST   /api/companyinfor                    - Create company info');
  console.log('   GET    /api/companyinfor/my-company         - Get current user\'s company');
  console.log('   PUT    /api/companyinfor/my-company         - Update current user\'s company');
  console.log('   GET    /api/companyinfor/merchant/:id       - Get company by merchant ID');
  console.log('   PUT    /api/companyinfor/merchant/:id       - Update company by merchant ID');
  console.log('   PUT    /api/companyinfor/merchant/:id/complete - Mark as complete');
  console.log('   GET    /api/companyinfor/list               - List all companies (admin)');
  console.log('   GET    /api/companyinfor/:id                - Get company by ID (admin)');
  console.log('   DELETE /api/companyinfor/:id                - Delete company (admin)');
}

// Run the test
testCompanyAPI();


