import fetch from 'node-fetch';

const baseURL = 'http://localhost:4001/api';

// Test script for approval/rejection endpoints
async function testApprovalEndpoints() {
  try {
    console.log('🧪 Testing Approval/Rejection Endpoints\n');

    // First, let's get a list of merchants to test with
    console.log('1. Fetching merchants list...');
    const merchantsResponse = await fetch(`${baseURL}/admin/merchants`, {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
        'Content-Type': 'application/json'
      }
    });

    if (!merchantsResponse.ok) {
      console.log('❌ Failed to fetch merchants. Make sure you have a valid admin token.');
      console.log('   Status:', merchantsResponse.status);
      return;
    }

    const merchantsData = await merchantsResponse.json();
    const merchants = merchantsData.merchants;
    
    if (merchants.length === 0) {
      console.log('❌ No merchants found to test with');
      return;
    }

    const testMerchant = merchants[0];
    console.log(`✅ Found test merchant: ${testMerchant.fullname} (${testMerchant.merchantid})`);

    // Test approval endpoint
    console.log('\n2. Testing approval endpoint...');
    const approveResponse = await fetch(`${baseURL}/admin/approve-merchant/${testMerchant.merchantid}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'All documents verified and requirements met',
        notes: 'Test approval via API'
      })
    });

    if (approveResponse.ok) {
      const approveData = await approveResponse.json();
      console.log('✅ Approval endpoint working:');
      console.log('   Response:', approveData);
    } else {
      console.log('❌ Approval endpoint failed:');
      console.log('   Status:', approveResponse.status);
      const errorText = await approveResponse.text();
      console.log('   Error:', errorText);
    }

    // Test rejection endpoint
    console.log('\n3. Testing rejection endpoint...');
    const rejectResponse = await fetch(`${baseURL}/admin/reject-merchant/${testMerchant.merchantid}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'Incomplete documentation',
        notes: 'Test rejection via API'
      })
    });

    if (rejectResponse.ok) {
      const rejectData = await rejectResponse.json();
      console.log('✅ Rejection endpoint working:');
      console.log('   Response:', rejectData);
    } else {
      console.log('❌ Rejection endpoint failed:');
      console.log('   Status:', rejectResponse.status);
      const errorText = await rejectResponse.text();
      console.log('   Error:', errorText);
    }

    // Test without reason (should fail)
    console.log('\n4. Testing rejection without reason (should fail)...');
    const rejectNoReasonResponse = await fetch(`${baseURL}/admin/reject-merchant/${testMerchant.merchantid}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notes: 'Test rejection without reason'
      })
    });

    if (rejectNoReasonResponse.status === 400) {
      console.log('✅ Rejection without reason properly rejected (400 status)');
    } else {
      console.log('❌ Rejection without reason should have failed with 400 status');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Instructions for running the test
console.log('📋 Instructions:');
console.log('1. Make sure your server is running on http://localhost:4001');
console.log('2. Replace "YOUR_ADMIN_TOKEN_HERE" with a valid admin JWT token');
console.log('3. Run: node test-approval-endpoints.js');
console.log('');

// Uncomment the line below to run the test
// testApprovalEndpoints();
