const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Test data
const testData = {
  companyName: "Test Company Ltd",
  companyEmail: "test@company.com",
  businessDescription: "Test business description",
  licensingRequired: false,
  topCountries: ["United States", "Canada"]
};

async function testCompletionFix() {
  try {
    console.log('🧪 Testing Form Completion Fix...\n');

    // First, let's get a valid token by logging in
    console.log('1. Logging in to get token...');
    const loginResponse = await axios.post(`${BASE_URL}/user/login`, {
      emailOrPhone: "mayekujimmy997@gmail.com", // Use your test user
      password: "password123" // Use your test password
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Test company info update
    console.log('2. Testing company info update...');
    const companyResponse = await axios.put(
      `${BASE_URL}/companyinfor/`,
      testData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Company info updated:', companyResponse.data.message);

    // Check form status
    console.log('\n3. Checking form status...');
    const statusResponse = await axios.get(
      `${BASE_URL}/user/form-status`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const formStatus = statusResponse.data;
    console.log('📊 Form Status:');
    console.log(`   Overall Status: ${formStatus.overallStatus}`);
    console.log(`   Progress: ${formStatus.progress.completed}/${formStatus.progress.total} (${formStatus.progress.percentage}%)`);
    console.log('\n📋 Individual Forms:');
    
    Object.entries(formStatus.forms).forEach(([formName, status]) => {
      const statusIcon = status.completed ? '✅' : '❌';
      const hasDataIcon = status.hasData ? '📄' : '📭';
      console.log(`   ${statusIcon} ${formName}: ${status.completed ? 'Completed' : 'Pending'} ${hasDataIcon}`);
    });

    console.log(`\n🎯 Next Incomplete Form: ${formStatus.nextIncompleteForm || 'All forms completed!'}`);
    console.log(`🏁 All Forms Completed: ${formStatus.allFormsCompleted ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCompletionFix();










