// Simple test for the new narrative analysis functionality
const { DeepSeekAIService } = require('./src/services/deepseekAI.ts');

async function testNarrativeAnalysis() {
  const config = {
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    apiKey: process.env.DEEPSEEK_API_KEY || 'test-key',
    baseUrl: 'https://api.deepseek.com/v1',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 60000
  };

  const service = new DeepSeekAIService(config);

  const testCV = `
John Doe
Software Engineer

Experience:
- 5 years of JavaScript development
- 3 years of React experience
- 2 years of Node.js backend development
- Experience with AWS cloud services

Education:
- Bachelor's in Computer Science

Skills:
- JavaScript, React, Node.js
- AWS, Docker
- Git, Agile methodologies
`;

  try {
    console.log('Testing narrative analysis...');
    const result = await service.extractNarrativeFromCV(testCV);
    
    console.log('Narrative Analysis Result:');
    console.log('Analysis Type:', result.analysisType);
    console.log('Word Count:', result.wordCount);
    console.log('Generated At:', result.generatedAt);
    console.log('Narrative:');
    console.log(result.narrative);
    
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testNarrativeAnalysis()
    .then(() => console.log('Test completed successfully'))
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testNarrativeAnalysis };