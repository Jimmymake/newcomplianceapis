// Test script for profiles list API
// Run with: node test-profiles-list.js

const baseURL = 'http://localhost:4001/api';

async function testProfilesListAPI() {
  console.log('🧪 Testing Profiles List API...\n');

  let adminToken = '';
  let merchantToken = '';

  try {
    // Step 1: Create admin user
    console.log('1. Creating admin user...');
    
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
      // Try to login if admin already exists
      const adminLoginData = {
        emailOrPhone: 'admin@example.com',
        password: 'password123'
      };

      const adminLoginResponse = await fetch(`${baseURL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminLoginData)
      });

      if (adminLoginResponse.ok) {
        const adminResult = await adminLoginResponse.json();
        adminToken = adminResult.token;
        console.log('✅ Admin user logged in');
      } else {
        console.log('❌ Admin authentication failed');
        return;
      }
    }

    // Step 2: Create merchant user
    console.log('\n2. Creating merchant user...');
    
    const merchantSignupData = {
      fullname: 'Merchant User',
      email: 'merchant@example.com',
      phonenumber: '+1234567896',
      location: 'Merchant City',
      password: 'password123',
      role: 'merchant'
    };

    const merchantSignupResponse = await fetch(`${baseURL}/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(merchantSignupData)
    });

    if (merchantSignupResponse.ok) {
      const merchantResult = await merchantSignupResponse.json();
      merchantToken = merchantResult.token;
      console.log('✅ Merchant user created');
    } else {
      console.log('❌ Merchant creation failed');
    }

    // Step 3: Test GET /api/user/profiles with admin token
    console.log('\n3. Testing GET /api/user/profiles (Admin access)...');
    const profilesResponse = await fetch(`${baseURL}/user/profiles`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (profilesResponse.ok) {
      const profilesResult = await profilesResponse.json();
      console.log('✅ GET /api/user/profiles - SUCCESS');
      console.log('   Total Users:', profilesResult.statistics.totalUsers);
      console.log('   Total Merchants:', profilesResult.statistics.totalMerchants);
      console.log('   Total Admins:', profilesResult.statistics.totalAdmins);
      console.log('   Users in response:', profilesResult.users.length);
      console.log('   Pagination:', `${profilesResult.pagination.current}/${profilesResult.pagination.total} pages`);
      
      // Show first few users
      if (profilesResult.users.length > 0) {
        console.log('   Sample users:');
        profilesResult.users.slice(0, 3).forEach((user, index) => {
          console.log(`     ${index + 1}. ${user.fullname} (${user.role}) - ${user.onboardingStatus}`);
        });
      }
    } else {
      console.log('❌ GET /api/user/profiles - FAILED:', profilesResponse.status);
      const errorData = await profilesResponse.json();
      console.log('   Error:', errorData.message);
    }

    // Step 4: Test with query parameters
    console.log('\n4. Testing GET /api/user/profiles with filters...');
    const filteredResponse = await fetch(`${baseURL}/user/profiles?role=merchant&limit=5&search=merchant`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (filteredResponse.ok) {
      const filteredResult = await filteredResponse.json();
      console.log('✅ GET /api/user/profiles with filters - SUCCESS');
      console.log('   Filtered users:', filteredResult.users.length);
      console.log('   Applied filters:', filteredResult.filters);
    } else {
      console.log('❌ GET /api/user/profiles with filters - FAILED:', filteredResponse.status);
    }

    // Step 5: Test with merchant token (should fail)
    console.log('\n5. Testing GET /api/user/profiles (Merchant access - should fail)...');
    const merchantProfilesResponse = await fetch(`${baseURL}/user/profiles`, {
      headers: {
        'Authorization': `Bearer ${merchantToken}`
      }
    });

    if (merchantProfilesResponse.ok) {
      console.log('❌ GET /api/user/profiles with merchant token - UNEXPECTED SUCCESS');
    } else {
      console.log('✅ GET /api/user/profiles with merchant token - CORRECTLY FAILED');
      console.log('   Status:', merchantProfilesResponse.status);
      const errorData = await merchantProfilesResponse.json();
      console.log('   Error:', errorData.message);
    }

    // Step 6: Test CSV export
    console.log('\n6. Testing GET /api/user/profiles/export...');
    const exportResponse = await fetch(`${baseURL}/user/profiles/export`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (exportResponse.ok) {
      const csvContent = await exportResponse.text();
      console.log('✅ GET /api/user/profiles/export - SUCCESS');
      console.log('   CSV content length:', csvContent.length, 'characters');
      console.log('   First line:', csvContent.split('\n')[0]);
    } else {
      console.log('❌ GET /api/user/profiles/export - FAILED:', exportResponse.status);
    }

    // Step 7: Test with no token (should fail)
    console.log('\n7. Testing GET /api/user/profiles (No token - should fail)...');
    const noTokenResponse = await fetch(`${baseURL}/user/profiles`);

    if (noTokenResponse.ok) {
      console.log('❌ GET /api/user/profiles without token - UNEXPECTED SUCCESS');
    } else {
      console.log('✅ GET /api/user/profiles without token - CORRECTLY FAILED');
      console.log('   Status:', noTokenResponse.status);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Profiles List API testing completed!');
  console.log('\n📋 Summary of Profiles List APIs:');
  console.log('✅ GET /api/user/profiles - Get list of all profiles (Admin only)');
  console.log('✅ GET /api/user/profiles/export - Export profiles to CSV (Admin only)');
  console.log('\n🔧 Query Parameters for /api/user/profiles:');
  console.log('   - page: Page number (default: 1)');
  console.log('   - limit: Items per page (default: 20)');
  console.log('   - role: Filter by role (merchant, admin)');
  console.log('   - status: Filter by onboarding status');
  console.log('   - search: Search by name, email, phone, or merchant ID');
  console.log('   - sortBy: Sort field (default: createdAt)');
  console.log('   - sortOrder: Sort order (asc, desc)');
}

// Run the test
testProfilesListAPI();


