/**
 * Test script for narrative CV analysis
 */

const testCVContent = `
John Smith
Senior Software Engineer

EXPERIENCE:
- 5 years at TechCorp as Full Stack Developer
- Built microservices using Node.js and React
- Led team of 3 developers on e-commerce platform
- Implemented CI/CD pipelines using Docker and AWS

SKILLS:
- JavaScript, TypeScript, Python
- React, Node.js, Express
- AWS, Docker, Kubernetes
- PostgreSQL, MongoDB

EDUCATION:
- BS Computer Science, State University (2018)
`;

const testJobDescription = `
Senior Full Stack Engineer
TechStartup Inc.

We're looking for a Senior Full Stack Engineer to join our growing team. 

Requirements:
- 5+ years of experience in full stack development
- Strong proficiency in React, Node.js, and TypeScript
- Experience with cloud platforms (AWS preferred)
- Knowledge of microservices architecture
- Experience with containerization (Docker, Kubernetes)
- Strong problem-solving skills and ability to work in a fast-paced environment

Nice to have:
- Experience with GraphQL
- Knowledge of DevOps practices
- Previous startup experience
`;

async function testNarrativeAnalysis() {
  try {
    console.log('Testing narrative CV analysis...');
    
    // Test with job description (gap analysis)
    console.log('\n=== Testing with Job Description ===');
    const gapAnalysisResponse = await fetch('http://localhost:8787/api/v1/analyze/resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your-test-token-here',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeText: testCVContent,
        jobDescriptionText: testJobDescription
      })
    });
    
    const gapResult = await gapAnalysisResponse.json();
    console.log('Gap Analysis Result:', JSON.stringify(gapResult, null, 2));
    
    // Test without job description (standalone analysis)
    console.log('\n=== Testing without Job Description ===');
    const standaloneResponse = await fetch('http://localhost:8787/api/v1/analyze/resume', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your-test-token-here',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeText: testCVContent
      })
    });
    
    const standaloneResult = await standaloneResponse.json();
    console.log('Standalone Analysis Result:', JSON.stringify(standaloneResult, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testNarrativeAnalysis();