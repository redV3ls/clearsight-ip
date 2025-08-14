// Test narrative analysis with proper authentication
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

Junior Developer | WebSolutions | 2016-2018
- Maintained legacy PHP applications and migrated to modern stack
- Implemented automated testing reducing bugs by 40%
- Participated in agile development processes
- Technologies: PHP, JavaScript, MySQL, jQuery

Education:
Bachelor of Science in Computer Science | State University | 2016
- Relevant coursework: Data Structures, Algorithms, Software Engineering
- Senior project: E-commerce platform with payment integration

Skills:
Technical: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, Git
Soft Skills: Leadership, Mentoring, Problem-solving, Communication, Project Management

Certifications:
- AWS Solutions Architect Associate (2021)
- Certified Kubernetes Administrator (2022)

Projects:
E-commerce Platform (2023)
- Built scalable platform handling 10K+ concurrent users
- Implemented real-time inventory management
- Technologies: React, Node.js, Redis, PostgreSQL

Open Source Contributions:
- Contributor to popular React UI library (500+ stars)
- Maintained npm package with 10K+ weekly downloads`;

// Use the token from PowerShell
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log('❌ Please provide the auth token as an argument');
  console.log('Usage: node test-with-auth.js <token>');
  process.exit(1);
}

async function testNarrativeAnalysis() {
  try {
    console.log('🧪 Testing Narrative CV Analysis...\n');
    console.log('🔐 Using provided auth token');
    
    // Create FormData for the request
    const formData = new FormData();
    formData.append('resumeText', testCV);
    
    console.log('📤 Sending analysis request...');
    console.log('📄 CV length:', testCV.length, 'characters');
    
    const startTime = Date.now();
    
    const response = await fetch('http://127.0.0.1:8787/api/v1/analyze/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      body: formData
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`\n⏱️  Response received in ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    
    if (response.status === 200) {
      console.log('\n🎉 SUCCESS! Analysis completed without timeout!');
      console.log('📊 Response type:', typeof result);
      console.log('📊 Response keys:', Object.keys(result));
      
      if (result.narrative) {
        console.log('✅ Has narrative field');
        console.log('📝 Word count:', result.word_count || 'N/A');
        console.log('⏱️  Processing time:', result.metadata?.processingTime || 'N/A', 'ms');
        console.log('🔄 Analysis type:', result.analysis_type || 'N/A');
        console.log('🤖 AI powered:', result.aiPowered);
        
        console.log('\n📖 Narrative preview (first 300 chars):');
        console.log('─'.repeat(50));
        console.log(result.narrative.substring(0, 300) + '...');
        console.log('─'.repeat(50));
        
        console.log('\n✅ NARRATIVE ANALYSIS IS WORKING!');
        console.log('🚫 No more 202 timeouts!');
        console.log('📈 Direct response with narrative content!');
        
      } else {
        console.log('⚠️  No narrative field found');
        console.log('📋 Full response:', JSON.stringify(result, null, 2));
      }
      
    } else if (response.status === 202) {
      console.log('\n⚠️  Still returning 202 (processing) - the old behavior');
      console.log('📋 This means the narrative implementation might not be active');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      
    } else if (response.status === 401) {
      console.log('\n🔐 Authentication failed - token might be expired');
      
    } else {
      console.log('\n❌ Unexpected response status:', response.status);
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

// Run the test
testNarrativeAnalysis();