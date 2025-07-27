// Test successful authentication flow
const baseUrl = 'https://clearsight-ip.com';

async function testSuccessfulAuth() {
  console.log('🔐 Testing Successful Authentication Flow');
  console.log('='.repeat(50));
  
  // Use a very strong password that should pass all validations
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Xk9#mP2$vL8@qR5!',  // Very strong password with special chars
    name: 'Test User'
  };
  
  console.log(`\n📝 Attempting registration with strong password`);
  console.log(`📧 Email: ${testUser.email}`);
  console.log(`🔒 Password: ${testUser.password}`);
  
  try {
    // Test registration
    const registerResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    console.log(`\n📊 Registration Status: ${registerResponse.status} ${registerResponse.statusText}`);
    
    const registerText = await registerResponse.text();
    console.log(`📥 Registration Response:`, registerText);
    
    if (registerResponse.status === 200 || registerResponse.status === 201) {
      console.log(`✅ Registration successful!`);
      
      // Test login
      console.log(`\n🔑 Attempting login...`);
      const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      console.log(`📊 Login Status: ${loginResponse.status} ${loginResponse.statusText}`);
      
      const loginText = await loginResponse.text();
      console.log(`📥 Login Response:`, loginText);
      
      if (loginResponse.status === 200) {
        const loginData = JSON.parse(loginText);
        if (loginData.token) {
          console.log(`✅ Login successful! Token received.`);
          
          // Test protected endpoint with token
          console.log(`\n🔒 Testing protected endpoint with token...`);
          const profileResponse = await fetch(`${baseUrl}/api/v1/users/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Accept': 'application/json'
            }
          });
          
          console.log(`📊 Profile Status: ${profileResponse.status} ${profileResponse.statusText}`);
          
          if (profileResponse.status === 200) {
            console.log(`✅ Protected endpoint access successful!`);
            console.log(`🎉 FULL AUTHENTICATION FLOW WORKING!`);
            return true;
          } else {
            console.log(`⚠️ Protected endpoint access failed`);
            return false;
          }
        } else {
          console.log(`❌ Login response missing token`);
          return false;
        }
      } else {
        console.log(`❌ Login failed`);
        return false;
      }
    } else {
      console.log(`❌ Registration failed`);
      try {
        const errorData = JSON.parse(registerText);
        console.log(`💡 Error details:`, errorData.error.message);
      } catch (e) {
        console.log(`💡 Raw error:`, registerText);
      }
      return false;
    }
  } catch (error) {
    console.log(`💥 Network error:`, error.message);
    return false;
  }
}

testSuccessfulAuth().then(success => {
  console.log(`\n🏁 Authentication test ${success ? 'PASSED' : 'FAILED'}`);
}).catch(console.error);