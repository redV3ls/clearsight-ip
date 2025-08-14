// Simple test script for narrative analysis
const testCV = `John Doe
Software Engineer

Professional Summary:
Experienced software engineer with 5 years in full-stack development, specializing in JavaScript, React, and Node.js. 
Led multiple high-impact projects and mentored junior developers.

Experience:
Senior Software Engineer | TechCorp Inc. | 2020-Present
- Led development of microservices architecture serving 100K+ users
- Implemented CI/CD pipelines reducing deployment time by 50%
- Mentored 3 junior developers and conducted technical interviews
- Technologies: React, Node.js, AWS, Docker

Software Engineer | StartupXYZ | 2018-2020
- Built responsive web applications using React and Redux
- Developed RESTful APIs with Node.js and Express
- Collaborated with design team on user experience improvements
- Technologies: JavaScript, React, Node.js, MongoDB

Education:
Bachelor of Science in Computer Science | State University | 2018
- Relevant coursework: Data Structures, Algorithms, Software Engineering

Skills:
Technical: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Git
Soft Skills: Leadership, Mentoring, Problem-solving, Communication`;

async function getAuthToken() {
  console.log('🔐 Getting authentication token...');
  
  const loginResponse = await fetch('http://127.0.0.1:8787/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'testuser2@example.com',
      password: 'Xk9#mP2$vL8@qR5!'
    })
  });
  
  if (!loginResponse.ok) {
    throw new Error(`Login failed: ${loginResponse.status}`);
  }
  
  const setCookie = loginResponse.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('No auth cookie received');
  }
  
  const token = setCookie.split('auth_token=')[1]?.split(';')[0];
  if (!token) {
    throw new Error('Could not extract token from cookie');
  }
  
  console.log('✅ Token obtained successfully');
  return token;
}

async function testNarrativeAnalysis() {
  try {
    console.log('🧪 Testing Narrative CV Analysis...\n');
    
    // Get authentication token
    const token = await getAuthToken();
    
    // Create FormData for the request
    const formData = new FormData();
    formData.append('resumeText', testCV);
    
    console.log('📤 Sending analysis request...');
    const startTime = Date.now();
    
    const response = await fetch('http://127.0.0.1:8787/api/v1/analyze/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⏱️  Response received in ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    
    if (response.status === 200) {
      console.log('\n🎉 SUCCESS! Analysis completed without timeout!');
      console.log('📊 Response includes narrative:', !!result.narrative);
      console.log('📝 Word count:', result.word_count || 'N/A');
      console.log('⏱️  Processing time:', result.metadata?.processingTime || 'N/A', 'ms');
      console.log('🔄 Analysis type:', result.analysis_type || 'N/A');
      console.log('📅 Timestamp:', result.timestamp || 'N/A');
      
      if (result.narrative) {
        console.log('\n📖 Narrative preview (first 200 chars):');
        console.log(result.narrative.substring(0, 200) + '...');
      }
      
      console.log('\n✅ NARRATIVE ANALYSIS IS WORKING! No more 202 timeouts!');
      
    } else if (response.status === 202) {
      console.log('\n⚠️  Still returning 202 (processing) - the old behavior');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      
    } else {
      console.log('\n❌ Unexpected response status:', response.status);
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testNarrativeAnalysis();