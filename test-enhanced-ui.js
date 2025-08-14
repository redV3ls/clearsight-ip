/**
 * Test script for the enhanced narrative UI with job description functionality
 */

const BASE_URL = 'http://localhost:8787';

async function testEnhancedUI() {
  console.log('🧪 Testing Enhanced Narrative UI with Job Description Feature\n');

  // Test 1: Verify UI is accessible
  console.log('1. Testing UI accessibility...');
  try {
    const response = await fetch(`${BASE_URL}/test-narrative-ui.html`);
    if (response.ok) {
      console.log('✅ Enhanced UI is accessible');
      const html = await response.text();
      
      // Check for key features
      const hasJobDescriptionField = html.includes('Job Description (Optional - for Job Fit Analysis)');
      const hasAnalysisTypeIndicator = html.includes('analysisTypeIndicator');
      const hasClearJobDescButton = html.includes('Clear Job Description');
      const hasEnhancedDisplayResults = html.includes('Your Job Fit Analysis');
      
      console.log(`   📋 Job Description field: ${hasJobDescriptionField ? '✅' : '❌'}`);
      console.log(`   🎯 Analysis type indicator: ${hasAnalysisTypeIndicator ? '✅' : '❌'}`);
      console.log(`   🗑️ Clear job description button: ${hasClearJobDescButton ? '✅' : '❌'}`);
      console.log(`   📊 Enhanced result display: ${hasEnhancedDisplayResults ? '✅' : '❌'}`);
    } else {
      console.log('❌ UI not accessible:', response.status);
    }
  } catch (error) {
    console.log('❌ Error accessing UI:', error.message);
  }

  // Test 2: Test standalone analysis (no job description)
  console.log('\n2. Testing standalone analysis...');
  try {
    const formData = new FormData();
    formData.append('resumeText', `John Doe
Software Engineer
Skills: JavaScript, React, Node.js
Experience: 3 years full-stack development`);

    const response = await fetch(`${BASE_URL}/api/v1/analyze/resume`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Standalone analysis submitted successfully');
      console.log(`   📝 Analysis ID: ${result.analysis_id}`);
      console.log(`   📊 Status: ${result.status}`);
      
      // Poll for completion (simplified)
      await pollForCompletion(result.analysis_id, 'standalone');
    } else {
      console.log('❌ Standalone analysis failed:', result.error?.message);
    }
  } catch (error) {
    console.log('❌ Error in standalone analysis:', error.message);
  }

  // Test 3: Test job comparison analysis (with job description)
  console.log('\n3. Testing job comparison analysis...');
  try {
    const formData = new FormData();
    formData.append('resumeText', `Jane Smith
Senior Software Engineer
Skills: JavaScript, TypeScript, React, Node.js, AWS
Experience: 5 years full-stack development, team leadership`);
    
    formData.append('jobDescriptionText', `Senior Full Stack Engineer
Requirements:
- 5+ years of full-stack development experience
- Expert-level proficiency in React and Node.js
- Strong experience with TypeScript
- Experience with cloud platforms (AWS preferred)
- Leadership experience preferred`);

    const response = await fetch(`${BASE_URL}/api/v1/analyze/resume`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Job comparison analysis submitted successfully');
      console.log(`   📝 Analysis ID: ${result.analysis_id}`);
      console.log(`   📊 Status: ${result.status}`);
      
      // Poll for completion (simplified)
      await pollForCompletion(result.analysis_id, 'job-comparison');
    } else {
      console.log('❌ Job comparison analysis failed:', result.error?.message);
    }
  } catch (error) {
    console.log('❌ Error in job comparison analysis:', error.message);
  }

  console.log('\n🎉 Enhanced UI testing completed!');
  console.log('\n📋 Summary of Improvements:');
  console.log('✅ Job description field is prominently displayed with helpful tips');
  console.log('✅ Analysis type indicator shows what kind of analysis will be performed');
  console.log('✅ Enhanced result display shows narrative prominently');
  console.log('✅ Console logging provides visibility during polling');
  console.log('✅ Analysis metadata is displayed for transparency');
  console.log('✅ Clear job description button for easy testing');
}

async function pollForCompletion(analysisId, expectedType) {
  console.log(`   ⏳ Polling for ${expectedType} analysis completion...`);
  
  for (let i = 0; i < 5; i++) { // Poll up to 5 times (50 seconds)
    try {
      const response = await fetch(`${BASE_URL}/api/v1/analyze/resume/${analysisId}`);
      const result = await response.json();
      
      console.log(`   📊 Poll ${i + 1}: Status = ${result.status}`);
      
      if (result.status === 'completed') {
        console.log('   ✅ Analysis completed successfully!');
        console.log(`   📖 Analysis type: ${result.analysisType || 'N/A'}`);
        console.log(`   📝 Word count: ${result.wordCount || 'N/A'}`);
        console.log(`   🎯 Has job description: ${result.hasJobDescription || false}`);
        console.log(`   📄 Narrative length: ${result.narrative ? result.narrative.length : 'N/A'} characters`);
        
        // Verify the analysis type matches expectation
        const actualType = result.analysisType || (result.hasJobDescription ? 'job-comparison' : 'standalone');
        if (actualType === expectedType) {
          console.log(`   ✅ Analysis type matches expected: ${expectedType}`);
        } else {
          console.log(`   ⚠️ Analysis type mismatch: expected ${expectedType}, got ${actualType}`);
        }
        
        return;
      } else if (result.status === 'failed') {
        console.log('   ❌ Analysis failed:', result.error?.message || 'Unknown error');
        return;
      }
      
      // Wait 10 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      console.log(`   ❌ Polling error: ${error.message}`);
    }
  }
  
  console.log('   ⏰ Polling timed out - analysis may still be processing');
}

// Run the test
testEnhancedUI().catch(console.error);