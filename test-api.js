// Simple API test script
// Run with: node test-api.js

const baseURL = 'http://localhost:4001/api';

async function testAPI() {
  console.log('🧪 Testing Compliance API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch('http://localhost:4001/');
    const healthData = await healthResponse.text();
    console.log('✅ Health check:', healthData);

    // Test 2: User signup
    console.log('\n2. Testing user signup...');
    const signupData = {
      fullname: 'Test User',
      email: 'test@example.com',
      phonenumber: '+1234567890',
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
      console.log('✅ User signup successful');
      console.log('   Merchant ID:', signupResult.user.merchantid);
      
      // Test 3: User login
      console.log('\n3. Testing user login...');
      const loginData = {
        emailOrPhone: 'test@example.com',
        password: 'password123'
      };

      const loginResponse = await fetch(`${baseURL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ User login successful');
        console.log('   Token received:', loginResult.token ? 'Yes' : 'No');
        
        const token = loginResult.token;
        const merchantid = loginResult.user.merchantid;

        // Test 4: Dashboard overview
        console.log('\n4. Testing dashboard overview...');
        const dashboardResponse = await fetch(`${baseURL}/dashboard/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (dashboardResponse.ok) {
          const dashboardResult = await dashboardResponse.json();
          console.log('✅ Dashboard overview successful');
          console.log('   Progress:', `${dashboardResult.progress.completed}/${dashboardResult.progress.total} steps`);
          console.log('   Status:', dashboardResult.status.current);
        } else {
          console.log('❌ Dashboard overview failed:', dashboardResponse.status);
        }

        // Test 5: Onboarding status
        console.log('\n5. Testing onboarding status...');
        const statusResponse = await fetch(`${baseURL}/onboarding/status/${merchantid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();
          console.log('✅ Onboarding status successful');
          console.log('   Overall status:', statusResult.overallStatus);
          console.log('   Progress:', `${statusResult.progress.completed}/${statusResult.progress.total} steps`);
        } else {
          console.log('❌ Onboarding status failed:', statusResponse.status);
        }

        // Test 6: Notifications
        console.log('\n6. Testing notifications...');
        const notificationsResponse = await fetch(`${baseURL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (notificationsResponse.ok) {
          const notificationsResult = await notificationsResponse.json();
          console.log('✅ Notifications successful');
          console.log('   Unread count:', notificationsResult.unreadCount);
        } else {
          console.log('❌ Notifications failed:', notificationsResponse.status);
        }

      } else {
        console.log('❌ User login failed:', loginResponse.status);
      }
    } else {
      console.log('❌ User signup failed:', signupResponse.status);
      const errorData = await signupResponse.json();
      console.log('   Error:', errorData.message);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 API testing completed!');
}

// Run the test
testAPI();
