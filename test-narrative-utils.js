// Test for the new NarrativeUtils functionality
const { NarrativeUtils } = require('./src/services/deepseekAI.ts');

function testNarrativeUtils() {
  console.log('Testing NarrativeUtils...');

  const testNarrative = `
    John Doe has built a strong foundation as a Software Engineer over the past 5 years.
    
    His experience with JavaScript, React, and Node.js demonstrates a solid understanding of modern web development.
    
    
    Areas for improvement include cloud architecture and DevOps practices.
  `;

  // Test word count
  const wordCount = NarrativeUtils.calculateWordCount(testNarrative);
  console.log('Word Count:', wordCount);

  // Test character count
  const charCount = NarrativeUtils.calculateCharacterCount(testNarrative);
  console.log('Character Count:', charCount);

  // Test reading time
  const readingTime = NarrativeUtils.estimateReadingTime(wordCount);
  console.log('Estimated Reading Time:', readingTime, 'minutes');

  // Test narrative cleaning
  const cleanedNarrative = NarrativeUtils.cleanNarrative(testNarrative);
  console.log('Cleaned Narrative:');
  console.log(cleanedNarrative);

  // Test validation
  const validation = NarrativeUtils.validateNarrative(cleanedNarrative);
  console.log('Validation:', validation);

  // Test metadata generation
  const metadata = NarrativeUtils.generateMetadata(cleanedNarrative, 'standalone', 2500);
  console.log('Generated Metadata:');
  console.log(JSON.stringify(metadata, null, 2));

  return {
    wordCount,
    charCount,
    readingTime,
    cleanedNarrative,
    validation,
    metadata
  };
}

// Only run if this file is executed directly
if (require.main === module) {
  try {
    const results = testNarrativeUtils();
    console.log('\n✅ All NarrativeUtils tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

module.exports = { testNarrativeUtils };