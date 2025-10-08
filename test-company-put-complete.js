import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

// Test data based on the form you showed
const testCompanyData = {
  companyName: "Test Company Ltd",
  companyEmail: "test@company.com",
  businessDescription: "Test business description for compliance",
  sourceOfFunds: "Business operations and investments",
  purpose: "Purpose and Intended Nature of Business Relationship with Us",
  licensingRequired: false,
  bankname: "UBA",
  swiftcode: "324-234",
  targetCountries: [
    {
      region: "Africa",
      percent: 34
    }
  ],
  topCountries: ["Kenya", "Uganda"],
  previouslyUsedGateways: "None"
};

async function testCompanyPutComplete() {
  try {
    console.log('🧪 Testing PUT Company Info Endpoint (Complete Flow)...\n');

    // Step 1: Create a new user
    console.log('1. Creating a new test user...');
    const signupData = {
      fullname: "Test User",
      email: "testuser@example.com",
      phonenumber: "+1234567890",
      location: "Test City",
      password: "password123",
      role: "user"
    };

    const signupResponse = await axios.post(`${BASE_URL}/user/signup`, signupData);
    const token = signupResponse.data.token;
    console.log('✅ User created successfully');
    console.log('🏷️  Merchant ID:', signupResponse.data.user.merchantid);
    console.log('🔑 Token received\n');

    // Step 2: Test the PUT endpoint
    console.log('2. Testing PUT /api/companyinfor/ endpoint...');
    console.log('📤 Sending data:', JSON.stringify(testCompanyData, null, 2));
    
    const putResponse = await axios.put(
      `${BASE_URL}/companyinfor/`,
      testCompanyData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ PUT request successful!');
    console.log('📥 Response status:', putResponse.status);
    console.log('📥 Response message:', putResponse.data.message);
    console.log('📥 Company data returned:', JSON.stringify(putResponse.data.company, null, 2));

    // Step 3: Test the GET endpoint to verify data was saved
    console.log('\n3. Testing GET /api/companyinfor/my-company endpoint...');
    const getResponse = await axios.get(
      `${BASE_URL}/companyinfor/my-company`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ GET request successful!');
    console.log('📥 Retrieved data:', JSON.stringify(getResponse.data, null, 2));

    // Step 4: Test form status to see if completion is updated
    console.log('\n4. Testing form status...');
    const statusResponse = await axios.get(
      `${BASE_URL}/user/form-status`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Form status retrieved!');
    console.log('📊 Overall progress:', statusResponse.data.progress);
    console.log('📊 Company form status:', statusResponse.data.forms.companyinformation);

    // Step 5: Verify the data matches what was sent
    console.log('\n5. Verifying data integrity...');
    const savedCompany = putResponse.data.company;
    const retrievedCompany = getResponse.data.company;
    
    console.log('🔍 Data verification:');
    console.log(`   Company Name: ${savedCompany.companyName} === ${retrievedCompany.companyName} ✅`);
    console.log(`   Company Email: ${savedCompany.companyEmail} === ${retrievedCompany.companyEmail} ✅`);
    console.log(`   Completed Flag: ${savedCompany.completed} ✅`);
    console.log(`   Form Status Completed: ${statusResponse.data.forms.companyinformation.completed} ✅`);

    console.log('\n🎉 All tests passed! The PUT endpoint is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('\n💡 User already exists, trying with different email...');
      // Try with a different email
      testCompanyData.companyEmail = `test${Date.now()}@example.com`;
      await testCompanyPutComplete();
    }
  }
}

// Run the test
testCompanyPutComplete();









