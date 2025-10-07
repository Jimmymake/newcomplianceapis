// Test script for complete profiles list API
// Run with: node test-complete-profiles.js

const baseURL = 'http://localhost:4000/api';

async function testCompleteProfilesAPI() {
  console.log('🧪 Testing Complete Profiles List API...\n');

  let adminToken = '';

  try {
    // Step 1: Create/Login admin user
    console.log('1. Setting up admin authentication...');
    
    const adminLoginData = {
      emailOrPhone: 'admin@example.com',
      password: 'password123'
    };

    let adminLoginResponse = await fetch(`${baseURL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminLoginData)
    });

    if (!adminLoginResponse.ok) {
      // Create admin if doesn't exist
      const adminSignupData = {
        fullname: 'Admin User',
        email: 'admin@example.com',
        phonenumber: '+1234567895',
        location: 'Admin City',
        password: 'password123',
        role: 'admin'
      };

      const adminSignupResponse = await fetch(`${baseURL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminSignupData)
      });

      if (adminSignupResponse.ok) {
        const adminResult = await adminSignupResponse.json();
        adminToken = adminResult.token;
        console.log('✅ Admin user created');
      } else {
        console.log('❌ Admin creation failed');
        return;
      }
    } else {
      const adminResult = await adminLoginResponse.json();
      adminToken = adminResult.token;
      console.log('✅ Admin user logged in');
    }

    // Step 2: Test GET /api/user/profiles with complete data
    console.log('\n2. Testing GET /api/user/profiles (Complete Data)...');
    const profilesResponse = await fetch(`${baseURL}/user/profiles?limit=5`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (profilesResponse.ok) {
      const profilesResult = await profilesResponse.json();
      console.log('✅ GET /api/user/profiles - SUCCESS');
      console.log('   Total Users:', profilesResult.statistics.totalUsers);
      console.log('   Users in response:', profilesResult.users.length);
      console.log('   Data Summary:', profilesResult.dataSummary);
      
      // Show detailed structure of first user
      if (profilesResult.users.length > 0) {
        const firstUser = profilesResult.users[0];
        console.log('\n   📋 Sample User Structure:');
        console.log('     User Info:', {
          name: firstUser.user.fullname,
          email: firstUser.user.email,
          merchantid: firstUser.user.merchantid,
          status: firstUser.user.onboardingStatus
        });
        
        console.log('     📊 Completion Summary:', firstUser.completionSummary);
        
        console.log('     📄 Available Data:');
        console.log('       - Company Info:', firstUser.companyinformation ? '✅' : '❌');
        console.log('       - UBO Info:', firstUser.ubo ? '✅' : '❌');
        console.log('       - Payment Info:', firstUser.paymentandprosessing ? '✅' : '❌');
        console.log('       - Settlement Bank:', firstUser.settlmentbankdetails ? '✅' : '❌');
        console.log('       - Risk Management:', firstUser.riskmanagement ? '✅' : '❌');
        console.log('       - KYC Docs:', firstUser.kycdocs ? '✅' : '❌');
        
        // Show some actual data if available
        if (firstUser.companyinformation) {
          console.log('     🏢 Company Data Sample:', {
            companyName: firstUser.companyinformation.companyName,
            country: firstUser.companyinformation.countryOfIncorporation,
            completed: firstUser.companyinformation.completed
          });
        }
        
        if (firstUser.ubo) {
          console.log('     👥 UBO Data Sample:', {
            uboCount: firstUser.ubo.ubo?.length || 0,
            completed: firstUser.ubo.completed
          });
        }
      }
    } else {
      console.log('❌ GET /api/user/profiles - FAILED:', profilesResponse.status);
      const errorData = await profilesResponse.json();
      console.log('   Error:', errorData.message);
    }

    // Step 3: Test with filters
    console.log('\n3. Testing with filters (merchants only)...');
    const filteredResponse = await fetch(`${baseURL}/user/profiles?role=merchant&limit=3`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (filteredResponse.ok) {
      const filteredResult = await filteredResponse.json();
      console.log('✅ Filtered results - SUCCESS');
      console.log('   Filtered users:', filteredResult.users.length);
      console.log('   Applied filters:', filteredResult.filters);
      
      // Show completion statistics
      console.log('   📈 Data Completion Stats:');
      Object.entries(filteredResult.dataSummary).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    } else {
      console.log('❌ Filtered results - FAILED:', filteredResponse.status);
    }

    // Step 4: Test search functionality
    console.log('\n4. Testing search functionality...');
    const searchResponse = await fetch(`${baseURL}/user/profiles?search=test&limit=2`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      console.log('✅ Search results - SUCCESS');
      console.log('   Search results:', searchResult.users.length);
      console.log('   Search term:', searchResult.filters.search);
    } else {
      console.log('❌ Search results - FAILED:', searchResponse.status);
    }

    // Step 5: Test CSV export with complete data
    console.log('\n5. Testing CSV export...');
    const exportResponse = await fetch(`${baseURL}/user/profiles/export`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (exportResponse.ok) {
      const csvContent = await exportResponse.text();
      console.log('✅ CSV export - SUCCESS');
      console.log('   CSV content length:', csvContent.length, 'characters');
      console.log('   First line (headers):', csvContent.split('\n')[0]);
    } else {
      console.log('❌ CSV export - FAILED:', exportResponse.status);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Complete Profiles API testing completed!');
  console.log('\n📋 API Response Structure:');
  console.log('{');
  console.log('  "success": true,');
  console.log('  "users": [');
  console.log('    {');
  console.log('      "user": { /* User basic info */ },');
  console.log('      "companyinformation": { /* Company data or null */ },');
  console.log('      "ubo": { /* UBO data or null */ },');
  console.log('      "paymentandprosessing": { /* Payment data or null */ },');
  console.log('      "settlmentbankdetails": { /* Settlement data or null */ },');
  console.log('      "riskmanagement": { /* Risk data or null */ },');
  console.log('      "kycdocs": { /* KYC data or null */ },');
  console.log('      "completionSummary": { /* Boolean flags for each step */ }');
  console.log('    }');
  console.log('  ],');
  console.log('  "pagination": { /* Pagination info */ },');
  console.log('  "statistics": { /* Overall stats */ },');
  console.log('  "dataSummary": { /* Data completion stats */ }');
  console.log('}');
}

// Run the test
testCompleteProfilesAPI();


