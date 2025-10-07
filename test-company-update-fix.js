// Quick test to verify company update fix
// Run with: node test-company-update-fix.js

const baseURL = 'http://localhost:4000/api';

async function testCompanyUpdateFix() {
  console.log('🔧 Testing Company Update Fix...\n');

  let token = '';
  let merchantid = '';

  try {
    // Step 1: Login or create user
    console.log('1. Getting authentication...');
    
    const loginData = {
      emailOrPhone: 'companytest@example.com',
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
        fullname: 'Test User',
        email: 'companytest@example.com',
        phonenumber: '+1234567893',
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

    // Step 2: Ensure company exists
    console.log('\n2. Ensuring company exists...');
    const getCompanyResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!getCompanyResponse.ok) {
      // Create company
      const companyData = {
        companyName: 'Test Company Ltd',
        businessDescription: 'Initial description',
        companyEmail: 'test@company.com'
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
        console.log('✅ Company created');
      } else {
        console.log('❌ Company creation failed');
        return;
      }
    } else {
      console.log('✅ Company exists');
    }

    // Step 3: Test the update
    console.log('\n3. Testing company update...');
    const updateData = {
      businessDescription: 'UPDATED: ' + new Date().toISOString(),
      companyEmail: 'updated@company.com'
    };

    console.log('   Sending update:', updateData);

    const updateResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('   Response status:', updateResponse.status);

    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ UPDATE SUCCESSFUL!');
      console.log('   Updated description:', updateResult.company.businessDescription);
      console.log('   Updated email:', updateResult.company.companyEmail);
    } else {
      console.log('❌ UPDATE FAILED');
      const errorData = await updateResponse.json();
      console.log('   Error:', errorData);
    }

    // Step 4: Verify the update
    console.log('\n4. Verifying update...');
    const verifyResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      console.log('✅ Verification successful');
      console.log('   Current description:', verifyResult.company.businessDescription);
      console.log('   Current email:', verifyResult.company.companyEmail);
    } else {
      console.log('❌ Verification failed');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

// Run the test
testCompanyUpdateFix();





