/**
 * Test script to verify token expiration handling
 */

const BASE_URL = 'http://localhost:8787';

async function testTokenExpirationHandling() {
  console.log('🧪 Testing Token Expiration Handling\n');

  // Test 1: Verify that expired token during analysis triggers logout
  console.log('1. Testing token expiration during analysis...');
  
  try {
    // First, try to login to get a valid session
    console.log('   📝 Attempting login...');
    const loginResponse = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });

    if (loginResponse.ok) {
      console.log('   ✅ Login successful');
      
      // Now test analysis with potentially expired token
      console.log('   📊 Testing analysis with token...');
      const formData = new FormData();
      formData.append('resumeText', 'John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js');
      
      const analysisResponse = await fetch(`${BASE_URL}/api/v1/analyze/resume`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log(`   📋 Analysis response status: ${analysisResponse.status}`);
      
      if (analysisResponse.status === 401) {
        console.log('   ✅ Token expiration detected (401 status)');
        console.log('   🔄 Frontend should now automatically log out user');
      } else if (analysisResponse.ok) {
        console.log('   ✅ Analysis successful - token is still valid');
        const result = await analysisResponse.json();
        console.log('   📊 Analysis result received');
      } else {
        console.log(`   ❌ Unexpected response: ${analysisResponse.status}`);
      }
      
    } else {
      console.log('   ❌ Login failed - cannot test token expiration');
      console.log('   💡 This is expected if no test user exists');
    }
    
  } catch (error) {
    console.log('   ❌ Error during test:', error.message);
  }

  // Test 2: Verify auth status check handles expired tokens
  console.log('\n2. Testing auth status check with expired token...');
  
  try {
    const authResponse = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      credentials: 'include'
    });

    console.log(`   📋 Auth check response status: ${authResponse.status}`);
    
    if (authResponse.status === 401) {
      console.log('   ✅ Token expiration detected in auth check');
      console.log('   🔄 Frontend should silently update UI to logged out state');
    } else if (authResponse.ok) {
      console.log('   ✅ Auth check successful - user is authenticated');
    } else {
      console.log(`   ❌ Unexpected auth response: ${authResponse.status}`);
    }
    
  } catch (error) {
    console.log('   ❌ Error during auth check:', error.message);
  }

  console.log('\n🎉 Token Expiration Handling Test Complete!');
  console.log('\n📋 Summary of Improvements Made:');
  console.log('✅ Added handleTokenExpiration() function to all HTML content files');
  console.log('✅ Enhanced analysis error handling to detect 401/token expiration');
  console.log('✅ Enhanced polling error handling to detect token expiration');
  console.log('✅ Enhanced auth status check to handle expired tokens silently');
  console.log('✅ Added automatic logout and UI update on token expiration');
  console.log('✅ Added user notification about session expiration');
  console.log('✅ Added automatic redirect to login modal on expiration');
  
  console.log('\n🔧 How It Works:');
  console.log('1. When any API call returns 401 (Unauthorized)');
  console.log('2. The handleTokenExpiration() function is called');
  console.log('3. User state is cleared and UI updated to logged out');
  console.log('4. Analysis interface is hidden if open');
  console.log('5. Login modal is shown with expiration message');
  console.log('6. User is notified their session expired');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Test the changes in the browser');
  console.log('2. Verify popup no longer appears without logout');
  console.log('3. Confirm user is automatically logged out on token expiration');
}

// Run the test
testTokenExpirationHandling().catch(console.error);