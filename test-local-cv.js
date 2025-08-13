// Local CV Analysis Test Script
// Run with: node test-local-cv.js

const API_BASE = 'http://127.0.0.1:8787/api/v1';

async function testCVAnalysis() {
  console.log('🧪 Testing CV Analysis Locally...\n');

  // Sample CV content for testing
  const sampleCV = `
John Doe
Software Engineer

Experience:
- 3 years JavaScript development
- React, Node.js, TypeScript
- AWS, Docker, Kubernetes
- Agile methodologies

Education:
- Bachelor's in Computer Science
- Certified AWS Solutions Architect
  `;

  const sampleJobDescription = `
Senior Full Stack Developer
Requirements:
- 5+ years JavaScript/TypeScript
- React, Vue.js experience
- Cloud platforms (AWS/Azure)
- Microservices architecture
- Team leadership experience
  `;

  try {
    console.log('📤 Sending CV analysis request...');
    
    const response = await fetch(`${API_BASE}/analyze/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: sampleCV,
        jobDescription: sampleJobDescription,
        analysisType: 'comprehensive'
      })
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

// Test health endpoint first
async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await fetch('http://127.0.0.1:8787/health');
    const result = await response.json();
    console.log('✅ Health check:', result);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function main() {
  const healthOk = await testHealth();
  if (healthOk) {
    await testCVAnalysis();
  }
}

main().catch(console.error);