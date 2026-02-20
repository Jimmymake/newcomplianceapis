// Debug script for company update issue
// Run with: node debug-company-update.js

const baseURL = 'http://localhost:4001/api';

async function debugCompanyUpdate() {
  console.log('🔍 Debugging Company Update Issue...\n');

  let token = '';
  let merchantid = '';

  try {
    // Step 1: Create a test user and company
    console.log('1. Creating test user and company...');
    
    // First, try to login with existing user or create new one
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
      // User doesn't exist, create one
      console.log('   User not found, creating new user...');
      const signupData = {
        fullname: 'Debug Test User',
        email: 'companytest@example.com',
        phonenumber: '+1234567892',
        location: 'Debug City',
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
    } else {
      // User exists, get token
      const loginResult = await loginResponse.json();
      token = loginResult.token;
      merchantid = loginResult.user.merchantid;
      console.log('✅ User login successful');
      console.log('   Merchant ID:', merchantid);
    }

    // Step 2: Check if company exists, create if not
    console.log('\n2. Checking/creating company information...');
    const getCompanyResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!getCompanyResponse.ok) {
      // Company doesn't exist, create one
      console.log('   Company not found, creating new company...');
      const companyData = {
        companyName: 'Debug Test Company',
        merchantUrls: 'https://debugtest.com',
        dateOfIncorporation: '2020-01-15',
        incorporationNumber: 'DEBUG123456',
        countryOfIncorporation: 'United States',
        companyEmail: 'info@debugtest.com',
        contactPerson: {
          fullName: 'Debug User',
          phone: '+1234567890',
          email: 'debug@debugtest.com'
        },
        businessDescription: 'A debug test company',
        sourceOfFunds: 'Private investment',
        purpose: 'Debug testing'
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
        console.log('✅ Company created successfully');
        console.log('   Company ID:', createResult.company._id);
      } else {
        console.log('❌ Company creation failed:', createResponse.status);
        const errorData = await createResponse.json();
        console.log('   Error:', errorData.message);
        return;
      }
    } else {
      const getResult = await getCompanyResponse.json();
      console.log('✅ Company found');
      console.log('   Company Name:', getResult.company.companyName);
    }

    // Step 3: Test the update endpoint with detailed logging
    console.log('\n3. Testing company update with detailed logging...');
    
    const updateData = {
      businessDescription: 'UPDATED: This is a test update at ' + new Date().toISOString(),
      topCountries: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'],
      companyEmail: 'updated@debugtest.com'
    };

    console.log('   Update data:', JSON.stringify(updateData, null, 2));
    console.log('   Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('   Merchant ID:', merchantid);

    const updateResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('   Response status:', updateResponse.status);
    console.log('   Response headers:', Object.fromEntries(updateResponse.headers.entries()));

    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Company update successful');
      console.log('   Updated Description:', updateResult.company.businessDescription);
      console.log('   Updated Email:', updateResult.company.companyEmail);
      console.log('   Updated Countries:', updateResult.company.topCountries);
    } else {
      console.log('❌ Company update failed');
      const errorData = await updateResponse.json();
      console.log('   Error:', errorData);
      
      // Try to get more details about the error
      const errorText = await updateResponse.text();
      console.log('   Raw error response:', errorText);
    }

    // Step 4: Verify the update by getting the company again
    console.log('\n4. Verifying update by fetching company again...');
    const verifyResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      console.log('✅ Verification successful');
      console.log('   Current Description:', verifyResult.company.businessDescription);
      console.log('   Current Email:', verifyResult.company.companyEmail);
      console.log('   Current Countries:', verifyResult.company.topCountries);
    } else {
      console.log('❌ Verification failed:', verifyResponse.status);
    }

    // Step 5: Test with minimal update data
    console.log('\n5. Testing with minimal update data...');
    const minimalUpdate = {
      businessDescription: 'MINIMAL UPDATE: ' + Date.now()
    };

    const minimalResponse = await fetch(`${baseURL}/companyinfor/my-company`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(minimalUpdate)
    });

    if (minimalResponse.ok) {
      const minimalResult = await minimalResponse.json();
      console.log('✅ Minimal update successful');
      console.log('   Updated Description:', minimalResult.company.businessDescription);
    } else {
      console.log('❌ Minimal update failed:', minimalResponse.status);
      const errorData = await minimalResponse.json();
      console.log('   Error:', errorData);
    }

  } catch (error) {
    console.log('❌ Debug failed with error:', error.message);
    console.log('   Stack trace:', error.stack);
  }

  console.log('\n🏁 Debug completed!');
}

// Run the debug
debugCompanyUpdate();





