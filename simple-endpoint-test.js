// Simple endpoint testing with better compression handling
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
    console.log(`   📦 Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   🗜️ Content-Encoding: ${response.headers.get('content-encoding') || 'none'}`);
    
    // Check if response is successful
    if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ SUCCESS - Endpoint is working`);
    } else if (response.status === 401) {
      console.log(`   🔒 AUTHENTICATION REQUIRED - Endpoint exists but needs auth`);
    } else if (response.status === 404) {
      console.log(`   ❌ NOT FOUND - Endpoint may not exist`);
    } else {
      console.log(`   ⚠️ UNEXPECTED STATUS - May indicate an issue`);
    }

    // Try to get response size
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      console.log(`   📏 Content-Length: ${contentLength} bytes`);
    }

    return {
      status: response.status,
      contentType: response.headers.get('content-type'),
      working: response.status >= 200 && response.status < 500
    };

  } catch (error) {
    console.log(`   💥 NETWORK ERROR: ${error.message}`);
    return { status: 0, working: false, error: error.message };
  }
}

async function runEndpointTests() {
  console.log('🚀 Simple Endpoint Availability Test for https://clearsight-ip.com');
  console.log('='.repeat(70));
  console.log(`Started at: ${new Date().toISOString()}`);

  const results = [];

  // Public endpoints
  console.log('\n🌐 PUBLIC ENDPOINTS');
  console.log('='.repeat(30));
  
  results.push(await testEndpoint('/', 'GET', null, 'Root HTML page'));
  results.push(await testEndpoint('/health', 'GET', null, 'Basic health check'));
  results.push(await testEndpoint('/health/detailed', 'GET', null, 'Detailed health check'));
  results.push(await testEndpoint('/api/v1', 'GET', null, 'API information'));
  results.push(await testEndpoint('/docs', 'GET', null, 'OpenAPI documentation'));

  // Authentication endpoints
  console.log('\n🔐 AUTHENTICATION ENDPOINTS');
  console.log('='.repeat(30));
  
  results.push(await testEndpoint('/api/v1/auth/register', 'POST', {
    email: 'test@example.com',
    password: 'TestPass123!',
    name: 'Test User'
  }, 'User registration'));
  
  results.push(await testEndpoint('/api/v1/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'TestPass123!'
  }, 'User login'));

  // Protected endpoints (will return 401 but that means they exist)
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
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(30));
  
  const workingEndpoints = results.filter(r => r.working).length;
  const totalEndpoints = results.length;
  
  console.log(`✅ Working endpoints: ${workingEndpoints}/${totalEndpoints}`);
  console.log(`📈 Success rate: ${Math.round((workingEndpoints/totalEndpoints) * 100)}%`);
  
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

  console.log(`\n🏁 Test completed at: ${new Date().toISOString()}`);
  
  // Overall assessment
  const publicWorking = results.slice(0, 5).every(r => r.status === 200);
  const authWorking = results.slice(5, 7).some(r => r.status === 200 || r.status === 400);
  const protectedExist = results.slice(7).every(r => r.status === 401);
  
  console.log('\n🎯 ASSESSMENT:');
  if (publicWorking && authWorking && protectedExist) {
    console.log('✅ ALL SYSTEMS OPERATIONAL - API is fully functional');
  } else if (publicWorking) {
    console.log('⚠️ PARTIAL FUNCTIONALITY - Public endpoints work, some issues with protected routes');
  } else {
    console.log('❌ MAJOR ISSUES DETECTED - Core functionality may be impaired');
  }
}

runEndpointTests().catch(console.error);