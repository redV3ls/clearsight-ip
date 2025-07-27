// Test the live deployment at https://clearsight-ip.com
const baseUrl = 'https://clearsight-ip.com';

async function testEndpoint(path, method = 'GET', body = null, description = '') {
  try {
    console.log(`\n🧪 Testing: ${method} ${path}`);
    console.log(`   ${description}`);
    
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${path}`, options);
    
    console.log(`   📊 Status: ${response.status} ${response.statusText}`);
    
    // Check if response is successful
    if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ SUCCESS - Endpoint is working`);
      return { status: response.status, working: true };
    } else if (response.status === 401) {
      console.log(`   🔒 AUTHENTICATION REQUIRED - Endpoint exists but needs auth`);
      return { status: response.status, working: true };
    } else if (response.status === 404) {
      console.log(`   ❌ NOT FOUND - Endpoint may not exist`);
      return { status: response.status, working: false };
    } else {
      console.log(`   ⚠️ UNEXPECTED STATUS - ${response.status}`);
      return { status: response.status, working: false };
    }

  } catch (error) {
    console.log(`   💥 NETWORK ERROR: ${error.message}`);
    return { status: 0, working: false, error: error.message };
  }
}

async function testAuthenticationFlow() {
  console.log('\n🔐 TESTING AUTHENTICATION FLOW');
  console.log('='.repeat(50));
  
  // Test user registration
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'SecureTestPass123!',
    name: 'Test User'
  };
  
  console.log(`\n📝 Registering user: ${testUser.email}`);
  const registerResult = await testEndpoint('/api/v1/auth/register', 'POST', testUser, 'User registration');
  
  if (registerResult.status === 200 || registerResult.status === 201) {
    console.log(`   ✅ Registration successful`);
    
    // Test login
    console.log(`\n🔑 Logging in user: ${testUser.email}`);
    const loginResult = await testEndpoint('/api/v1/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    }, 'User login');
    
    if (loginResult.status === 200) {
      console.log(`   ✅ Login successful`);
      return true;
    } else {
      console.log(`   ❌ Login failed with status: ${loginResult.status}`);
      return false;
    }
  } else {
    console.log(`   ❌ Registration failed with status: ${registerResult.status}`);
    return false;
  }
}

async function runLiveTests() {
  console.log('🚀 Testing Live Deployment at https://clearsight-ip.com');
  console.log('='.repeat(70));
  console.log(`Started at: ${new Date().toISOString()}`);

  const results = [];

  // Test public endpoints
  console.log('\n🌐 PUBLIC ENDPOINTS');
  console.log('='.repeat(30));
  
  results.push(await testEndpoint('/', 'GET', null, 'Root HTML page'));
  results.push(await testEndpoint('/health', 'GET', null, 'Basic health check'));
  results.push(await testEndpoint('/health/detailed', 'GET', null, 'Detailed health check'));
  results.push(await testEndpoint('/api/v1', 'GET', null, 'API information'));
  results.push(await testEndpoint('/docs', 'GET', null, 'OpenAPI documentation'));
  results.push(await testEndpoint('/api/v1/docs', 'GET', null, 'Direct OpenAPI docs'));

  // Test authentication flow
  const authWorking = await testAuthenticationFlow();

  // Test protected endpoints (should return 401)
  console.log('\n🔒 PROTECTED ENDPOINTS (expecting 401)');
  console.log('='.repeat(30));
  
  results.push(await testEndpoint('/api/v1/users/profile', 'GET', null, 'User profile'));
  results.push(await testEndpoint('/api/v1/jobs/search', 'GET', null, 'Job search'));
  results.push(await testEndpoint('/api/v1/analyze/gap', 'POST', {
    user_skills: [{ skill: 'JavaScript', level: 'intermediate' }],
    target_job: { title: 'Developer', description: 'Test job', required_skills: ['JavaScript'] }
  }, 'Skill gap analysis'));
  results.push(await testEndpoint('/api/v1/trends/skills/emerging', 'GET', null, 'Emerging skills'));
  results.push(await testEndpoint('/api/v1/monitoring/cache/stats', 'GET', null, 'Cache statistics'));
  results.push(await testEndpoint('/api/v1/gdpr/export', 'POST', { format: 'json' }, 'GDPR data export'));
  results.push(await testEndpoint('/api/v1/audit/my-logs', 'GET', null, 'Audit logs'));

  // Summary
  console.log('\n📊 FINAL SUMMARY');
  console.log('='.repeat(30));
  
  const workingEndpoints = results.filter(r => r.working).length;
  const totalEndpoints = results.length;
  
  console.log(`✅ Working endpoints: ${workingEndpoints}/${totalEndpoints}`);
  console.log(`📈 Success rate: ${Math.round((workingEndpoints/totalEndpoints) * 100)}%`);
  console.log(`🔐 Authentication flow: ${authWorking ? '✅ Working' : '❌ Failed'}`);
  
  const statusCounts = {};
  results.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  
  console.log('\n📋 Status Code Distribution:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    const emoji = status === '200' ? '✅' : 
                  status === '401' ? '🔒' : 
                  status === '404' ? '❌' : 
                  status === '0' ? '💥' : '⚠️';
    console.log(`   ${emoji} ${status}: ${count} endpoints`);
  });

  console.log(`\n🏁 Live test completed at: ${new Date().toISOString()}`);
  
  // Overall assessment
  const publicWorking = results.slice(0, 6).every(r => r.status === 200);
  const protectedProperlySecured = results.slice(6).every(r => r.status === 401);
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  if (publicWorking && protectedProperlySecured && authWorking) {
    console.log('🎉 EXCELLENT! All systems operational - API is fully functional');
    console.log('   ✅ Public endpoints accessible');
    console.log('   ✅ Protected endpoints properly secured');
    console.log('   ✅ Authentication flow working');
    console.log('   ✅ Ready for production use');
  } else if (publicWorking && protectedProperlySecured) {
    console.log('✅ GOOD! Core functionality working - Minor auth issues');
    console.log('   ✅ Public endpoints accessible');
    console.log('   ✅ Protected endpoints properly secured');
    console.log('   ⚠️ Authentication flow needs attention');
  } else if (publicWorking) {
    console.log('⚠️ PARTIAL! Public endpoints work - Security issues detected');
    console.log('   ✅ Public endpoints accessible');
    console.log('   ❌ Security or authentication issues');
  } else {
    console.log('❌ CRITICAL ISSUES! Major functionality problems detected');
  }
}

runLiveTests().catch(console.error);