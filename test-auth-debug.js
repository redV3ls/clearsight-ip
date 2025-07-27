// Debug authentication endpoints
const baseUrl = 'https://clearsight-ip.com';

async function testAuthEndpoint(path, body, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 URL: ${baseUrl}${path}`);
    console.log(`📤 Request body:`, JSON.stringify(body, null, 2));
    
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📦 Content-Type: ${response.headers.get('content-type')}`);
    
    // Try to get response body
    const responseText = await response.text();
    console.log(`📥 Response:`, responseText.substring(0, 500));
    
    // Try to parse as JSON if possible
    try {
      const responseJson = JSON.parse(responseText);
      console.log(`📋 Parsed response:`, JSON.stringify(responseJson, null, 2));
    } catch (e) {
      console.log(`⚠️ Response is not valid JSON`);
    }
    
    return response.status;
  } catch (error) {
    console.log(`💥 Error:`, error.message);
    return 0;
  }
}

async function debugAuth() {
  console.log('🔍 Debugging Authentication Endpoints');
  console.log('='.repeat(50));
  
  // Test 1: Simple registration
  await testAuthEndpoint('/api/v1/auth/register', {
    email: 'simple@test.com',
    password: 'SimplePass123',
    name: 'Simple User'
  }, 'Simple registration');
  
  // Test 2: Registration with all fields
  await testAuthEndpoint('/api/v1/auth/register', {
    email: 'full@test.com',
    password: 'FullPass123!',
    name: 'Full User',
    organization: 'Test Org'
  }, 'Full registration');
  
  // Test 3: Login attempt (should fail but show error)
  await testAuthEndpoint('/api/v1/auth/login', {
    email: 'test@example.com',
    password: 'TestPass123'
  }, 'Login attempt');
  
  // Test 4: Invalid registration (missing fields)
  await testAuthEndpoint('/api/v1/auth/register', {
    email: 'invalid@test.com'
  }, 'Invalid registration (missing fields)');
  
  console.log('\n🏁 Debug completed');
}

debugAuth().catch(console.error);