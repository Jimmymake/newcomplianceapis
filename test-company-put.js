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

async function testCompanyPut() {
  try {
    console.log('🧪 Testing PUT Company Info Endpoint...\n');

    // First, let's try to get a valid token by logging in
    console.log('1. Attempting to login...');
    
    // Try with the fixed user credentials
    const loginResponse = await axios.post(`${BASE_URL}/user/login`, {
      emailOrPhone: "barasajimmy699@gmail.com",
      password: "password123" // You'll need to provide the correct password
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Test the PUT endpoint
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
    console.log('📥 Response data:', JSON.stringify(putResponse.data, null, 2));

    // Test the GET endpoint to verify data was saved
    console.log('\n3. Testing GET /api/companyinfor/my-company endpoint...');
    const getResponse = await axios.get(
      `${BASE_URL}/companyinfor/my-company`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ GET request successful!');
    console.log('📥 Retrieved data:', JSON.stringify(getResponse.data, null, 2));

    // Test form status to see if completion is updated
    console.log('\n4. Testing form status...');
    const statusResponse = await axios.get(
      `${BASE_URL}/user/form-status`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Form status retrieved!');
    console.log('📊 Company form status:', statusResponse.data.forms.companyinformation);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you provide the correct password for barasajimmy699@gmail.com');
    }
  }
}

// Run the test
testCompanyPut();







