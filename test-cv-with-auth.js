// Test CV analysis with authentication
// Run with: node test-cv-with-auth.js

const API_BASE = 'http://127.0.0.1:8787/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQzMzY5MjJiLTA4MWYtNDJhNy04ODBhLThlZDM3NDVjOWMwYSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU1MTEyODYxLCJleHAiOjE3NTUxOTkyNjF9.UfloawAqy_7CGmflVN5DX1iLmsqujI792h2jsy801Sx0M6mSWRHsN6c7bQfj_ED71Je8mA368o0eGB3E12QgQtY-Ned3uM0KlkCU8fRGSimUyEITXdCVF9TEyQEMMAm384Egg7dhLUGgmph-dIeDYKmyESCIK8PTyfCdpg8fhFuftjNmwoqVFD_QTBgNYuEVowzs9hTfF4ZA5AX9xPLWJwHvTvYCQbM2Y5UUHXq1IWkJWjh0H3_szeq3nockGgAYOAx97BJgiLlxshZtvAxFQPPJvh6Vzzr7qQLED73zfzFBy3qIklmLPlBk_h7LSzcLo8fFyNN1cgImdNwULbdmIQ';

async function testCVAnalysisWithAuth() {
  console.log('🧪 Testing CV Analysis with Authentication...\n');

  // Sample CV content for testing
  const sampleCV = `John Doe
Software Engineer

Experience:
- 3 years JavaScript development
- React, Node.js, TypeScript
- AWS, Docker, Kubernetes
- Agile methodologies

Education:
- Bachelor's in Computer Science
- Certified AWS Solutions Architect`;

  const sampleJobDescription = `Senior Full Stack Developer
Requirements:
- 5+ years JavaScript/TypeScript
- React, Vue.js experience
- Cloud platforms (AWS/Azure)
- Microservices architecture
- Team leadership experience`;

  try {
    console.log('📤 Sending CV analysis request with FormData...');
    
    // Create FormData
    const formData = new FormData();
    formData.append('resumeText', sampleCV);
    formData.append('jobDescription', sampleJobDescription);
    formData.append('analysisType', 'comprehensive');

    const response = await fetch(`${API_BASE}/analyze/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: formData
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Analysis Result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCVAnalysisWithAuth().catch(console.error);