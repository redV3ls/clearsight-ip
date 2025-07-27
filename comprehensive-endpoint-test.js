// Comprehensive endpoint testing for https://clearsight-ip.com
const baseUrl = 'https://clearsight-ip.com';

// Test data for various endpoints
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'SecureTestPass123!',
  name: 'Test User'
};

let authToken = null;

async function makeRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'identity'
  };

  if (authToken && !options.skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    method: 'GET',
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      data: null,
      error: error.message
    };
  }
}

function logTest(endpoint, description, result) {
  const status = result.status;
  const emoji = status >= 200 && status < 300 ? '✅' : 
                status >= 400 && status < 500 ? '⚠️' : '❌';
  
  console.log(`\n${emoji} ${endpoint}`);
  console.log(`   ${description}`);
  console.log(`   Status: ${status} ${result.statusText}`);
  
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  } else if (result.data && typeof result.data === 'object') {
    if (result.data.message) {
      console.log(`   Message: ${result.data.message}`);
    }
    if (result.data.features) {
      console.log(`   Features: ${Object.keys(result.data.features).length} active`);
    }
    if (result.data.error) {
      console.log(`   API Error: ${result.data.error.message || result.data.error.code}`);
    }
  }
}

async function testPublicEndpoints() {
  console.log('🌐 Testing Public Endpoints');
  console.log('='.repeat(50));

  // Root endpoint (HTML)
  const root = await makeRequest('/');
  logTest('GET /', 'Root HTML page', root);

  // Health endpoints
  const health = await makeRequest('/health');
  logTest('GET /health', 'Basic health check', health);

  const healthDetailed = await makeRequest('/health/detailed');
  logTest('GET /health/detailed', 'Detailed health check', healthDetailed);

  // API info
  const apiInfo = await makeRequest('/api/v1');
  logTest('GET /api/v1', 'API information', apiInfo);

  // Documentation
  const docs = await makeRequest('/docs');
  logTest('GET /docs', 'OpenAPI documentation', docs);
}

async function testAuthEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints');
  console.log('='.repeat(50));

  // Register new user
  const register = await makeRequest('/api/v1/auth/register', {
    method: 'POST',
    body: testUser,
    skipAuth: true
  });
  logTest('POST /api/v1/auth/register', 'User registration', register);

  // Login
  const login = await makeRequest('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: testUser.email,
      password: testUser.password
    },
    skipAuth: true
  });
  logTest('POST /api/v1/auth/login', 'User login', login);

  // Extract token for authenticated requests
  if (login.status === 200 && login.data.token) {
    authToken = login.data.token;
    console.log('   🎫 Auth token obtained for subsequent requests');
  }

  // Logout
  const logout = await makeRequest('/api/v1/auth/logout', {
    method: 'POST'
  });
  logTest('POST /api/v1/auth/logout', 'User logout', logout);
}

async function testUserEndpoints() {
  console.log('\n👤 Testing User Endpoints');
  console.log('='.repeat(50));

  if (!authToken) {
    console.log('❌ Skipping user endpoints - no auth token available');
    return;
  }

  // Get user profile
  const profile = await makeRequest('/api/v1/users/profile');
  logTest('GET /api/v1/users/profile', 'Get user profile', profile);

  // Update user profile
  const updateProfile = await makeRequest('/api/v1/users/profile', {
    method: 'POST',
    body: {
      bio: 'Test user profile',
      location: 'Test City',
      skills: [
        { skill: 'JavaScript', level: 'advanced', years_experience: 5 },
        { skill: 'Python', level: 'intermediate', years_experience: 3 }
      ]
    }
  });
  logTest('POST /api/v1/users/profile', 'Update user profile', updateProfile);

  // Get skill history
  const skillHistory = await makeRequest('/api/v1/users/profile/skills/history');
  logTest('GET /api/v1/users/profile/skills/history', 'Get skill history', skillHistory);
}

async function testJobEndpoints() {
  console.log('\n💼 Testing Job Endpoints');
  console.log('='.repeat(50));

  if (!authToken) {
    console.log('❌ Skipping job endpoints - no auth token available');
    return;
  }

  // Search jobs
  const jobSearch = await makeRequest('/api/v1/jobs/search?title=developer&limit=5');
  logTest('GET /api/v1/jobs/search', 'Search jobs', jobSearch);

  // Get specific job (if any exist)
  if (jobSearch.status === 200 && jobSearch.data.data && jobSearch.data.data.length > 0) {
    const jobId = jobSearch.data.data[0].id;
    const jobDetail = await makeRequest(`/api/v1/jobs/${jobId}`);
    logTest(`GET /api/v1/jobs/${jobId}`, 'Get job details', jobDetail);
  }
}

async function testAnalyzeEndpoints() {
  console.log('\n📊 Testing Analysis Endpoints');
  console.log('='.repeat(50));

  if (!authToken) {
    console.log('❌ Skipping analysis endpoints - no auth token available');
    return;
  }

  // Gap analysis
  const gapAnalysis = await makeRequest('/api/v1/analyze/gap', {
    method: 'POST',
    body: {
      user_skills: [
        { skill: 'JavaScript', level: 'intermediate', years_experience: 3 },
        { skill: 'React', level: 'beginner', years_experience: 1 }
      ],
      target_job: {
        title: 'Senior Frontend Developer',
        description: 'Looking for a senior frontend developer with expertise in React, TypeScript, and Node.js',
        required_skills: ['React', 'TypeScript', 'Node.js', 'JavaScript'],
        company: 'Test Company'
      }
    }
  });
  logTest('POST /api/v1/analyze/gap', 'Skill gap analysis', gapAnalysis);

  // Team analysis
  const teamAnalysis = await makeRequest('/api/v1/analyze/team', {
    method: 'POST',
    body: {
      team_members: [
        {
          id: 'member1',
          name: 'John Doe',
          skills: [
            { skill: 'JavaScript', level: 'advanced', years_experience: 5 },
            { skill: 'React', level: 'intermediate', years_experience: 3 }
          ]
        }
      ],
      project_requirements: {
        name: 'Test Project',
        description: 'A test project requiring various skills',
        required_skills: ['JavaScript', 'React', 'TypeScript']
      }
    }
  });
  logTest('POST /api/v1/analyze/team', 'Team analysis', teamAnalysis);

  // Get analysis history
  const gapHistory = await makeRequest('/api/v1/analyze/gap/history');
  logTest('GET /api/v1/analyze/gap/history', 'Gap analysis history', gapHistory);
}

async function testTrendsEndpoints() {
  console.log('\n📈 Testing Trends Endpoints');
  console.log('='.repeat(50));

  if (!authToken) {
    console.log('❌ Skipping trends endpoints - no auth token available');
    return;
  }

  // Industry trends
  const industryTrends = await makeRequest('/api/v1/trends/industry/technology?limit=5');
  logTest('GET /api/v1/trends/industry/technology', 'Industry trends', industryTrends);

  // Emerging skills
  const emergingSkills = await makeRequest('/api/v1/trends/skills/emerging?limit=10');
  logTest('GET /api/v1/trends/skills/emerging', 'Emerging skills', emergingSkills);

  // Regional trends
  const regionalTrends = await makeRequest('/api/v1/trends/geographic/US?limit=5');
  logTest('GET /api/v1/trends/geographic/US', 'Regional trends', regionalTrends);

  // Skill forecasts
  const forecasts = await makeRequest('/api/v1/trends/forecast', {
    method: 'POST',
    body: {
      skill_names: ['JavaScript', 'Python', 'React'],
      industry: 'technology',
      region: 'global'
    }
  });
  logTest('POST /api/v1/trends/forecast', 'Skill forecasts', forecasts);
}

async function testMonitoringEndpoints() {
  console.log('\n🔍 Testing Monitoring Endpoints');
  console.log('='.repeat(50));

  if (!authToken) {
    console.log('❌ Skipping monitoring endpoints - no auth token available');
    return;
  }

  // Cache stats
  const cacheStats = await makeRequest('/api/v1/monitoring/cache/stats');
  logTest('GET /api/v1/monitoring/cache/stats', 'Cache statistics', cacheStats);
}

async function testGDPREndpoints() {
  console.log('\n🛡️ Testing GDPR Endpoints');
  console.log('='.repeat(50));

  if (!authToken) {
    console.log('❌ Skipping GDPR endpoints - no auth token available');
    return;
  }

  // Request data export
  const dataExport = await makeRequest('/api/v1/gdpr/export', {
    method: 'POST',
    body: {
      format: 'json',
      categories: ['profile', 'skills', 'analyses']
    }
  });
  logTest('POST /api/v1/gdpr/export', 'Request data export', dataExport);
}

async function testAuditEndpoints() {
  console.log('\n📋 Testing Audit Endpoints');
  console.log('='.repeat(50));

  if (!authToken) {
    console.log('❌ Skipping audit endpoints - no auth token available');
    return;
  }

  // Get audit logs
  const auditLogs = await makeRequest('/api/v1/audit/my-logs?limit=10');
  logTest('GET /api/v1/audit/my-logs', 'Get audit logs', auditLogs);
}

async function runAllTests() {
  console.log('🚀 Comprehensive Endpoint Testing for https://clearsight-ip.com');
  console.log('='.repeat(70));
  console.log(`Started at: ${new Date().toISOString()}`);

  try {
    await testPublicEndpoints();
    await testAuthEndpoints();
    await testUserEndpoints();
    await testJobEndpoints();
    await testAnalyzeEndpoints();
    await testTrendsEndpoints();
    await testMonitoringEndpoints();
    await testGDPREndpoints();
    await testAuditEndpoints();

    console.log('\n🏁 All endpoint tests completed!');
    console.log(`Finished at: ${new Date().toISOString()}`);
    
    if (authToken) {
      console.log('\n✅ Authentication flow worked successfully');
    } else {
      console.log('\n⚠️ Authentication issues detected - some endpoints may not have been fully tested');
    }

  } catch (error) {
    console.error('\n💥 Test suite error:', error.message);
  }
}

runAllTests().catch(console.error);