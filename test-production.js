// Test narrative analysis in production environment
const testCV = `John Doe
Senior Software Engineer

Professional Summary:
Experienced software engineer with 8 years in full-stack development, specializing in JavaScript, React, and Node.js. 
Led multiple high-impact projects and mentored junior developers. Strong background in cloud architecture and DevOps practices.

Experience:
Senior Software Engineer | TechCorp Inc. | 2020-Present
- Led development of microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored 5 junior developers and conducted technical interviews
- Technologies: React, Node.js, AWS, Docker, Kubernetes

Software Engineer | StartupXYZ | 2018-2020
- Built responsive web applications using React and Redux
- Developed RESTful APIs with Node.js and Express
- Collaborated with design team on user experience improvements
- Technologies: JavaScript, React, Node.js, MongoDB

Education:
Bachelor of Science in Computer Science | State University | 2016
- Relevant coursework: Data Structures, Algorithms, Software Engineering

Skills:
Technical: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, Git
Soft Skills: Leadership, Mentoring, Problem-solving, Communication, Project Management`;

async function getAuthToken() {
  console.log('🔐 Getting authentication token from production...');
  
  const loginResponse = await fetch('https://clearsight-ip.vchernev93.workers.dev/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'prodtest@example.com',
      password: 'Zx9#kL2$mN8@'
    })
  });
  
  if (!loginResponse.ok) {
    const errorText = await loginResponse.text();
    throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
  }
  
  const setCookie = loginResponse.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('No auth cookie received');
  }
  
  const token = setCookie.split('auth_token=')[1]?.split(';')[0];
  if (!token) {
    throw new Error('Could not extract token from cookie');
  }
  
  console.log('✅ Production token obtained successfully');
  return token;
}

async function testProductionNarrativeAnalysis() {
  try {
    console.log('🧪 Testing Production Narrative CV Analysis...\n');
    
    // Get authentication token from production
    const token = await getAuthToken();
    
    // Create FormData for the request
    const formData = new FormData();
    formData.append('resumeText', testCV);
    
    console.log('📤 Sending analysis request to production...');
    console.log('📄 CV length:', testCV.length, 'characters');
    
    const startTime = Date.now();
    
    const response = await fetch('https://clearsight-ip.vchernev93.workers.dev/api/v1/analyze/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`\n⏱️  Response received in ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    
    if (response.status === 200) {
      console.log('\n🎉 SUCCESS! Production analysis completed!');
      console.log('📊 Response includes narrative:', !!result.narrative);
      console.log('📝 Word count:', result.word_count || 'N/A');
      console.log('⏱️  Processing time:', result.metadata?.processingTime || 'N/A', 'ms');
      console.log('🔄 Analysis type:', result.analysis_type || 'N/A');
      console.log('🤖 AI powered:', result.aiPowered);
      
      if (result.narrative) {
        console.log('\n📖 Narrative preview (first 200 chars):');
        console.log('─'.repeat(50));
        console.log(result.narrative.substring(0, 200) + '...');
        console.log('─'.repeat(50));
      }
      
      console.log('\n✅ PRODUCTION NARRATIVE ANALYSIS IS WORKING!');
      console.log('🚀 Cloudflare Workers optimizations successful!');
      
    } else if (response.status === 202) {
      console.log('\n⏳ Analysis is processing asynchronously (fallback mode)');
      console.log('📋 This means direct processing timed out but async fallback is working');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      
    } else {
      console.log('\n❌ Production analysis failed');
      console.log('📋 Status:', response.status);
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Production test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the production test
testProductionNarrativeAnalysis();