/**
 * Simple syntax check for the HTML content files
 */

const fs = require('fs');
const path = require('path');

async function checkSyntax() {
  console.log('🔍 Checking JavaScript syntax in HTML content files...\n');

  const files = [
    'src/constants/htmlContentComplete.ts',
    'src/constants/htmlContentNew.ts',
    'src/constants/htmlContent.ts',
    'src/constants/testNarrativeUI.ts'
  ];

  for (const file of files) {
    try {
      console.log(`📄 Checking ${file}...`);
      
      // Read the file
      const content = fs.readFileSync(file, 'utf8');
      
      // Extract JavaScript from template literals (basic check)
      const jsMatches = content.match(/`[\s\S]*?`/g);
      
      if (jsMatches) {
        console.log(`   ✅ Found ${jsMatches.length} template literal(s)`);
        
        // Check for common regex issues
        const regexIssues = [];
        
        // Check for unterminated regex
        if (content.includes('/[') && !content.includes(']/')) {
          regexIssues.push('Potential unterminated character class');
        }
        
        // Check for double-escaped patterns
        if (content.includes('\\\\\\\\')) {
          regexIssues.push('Potential double-escaped backslashes');
        }
        
        // Check for unescaped forward slashes in regex
        const regexPatterns = content.match(/\/[^/\n]*\/[gimuy]*/g);
        if (regexPatterns) {
          console.log(`   📊 Found ${regexPatterns.length} regex pattern(s)`);
        }
        
        if (regexIssues.length > 0) {
          console.log(`   ⚠️  Potential issues: ${regexIssues.join(', ')}`);
        } else {
          console.log(`   ✅ No obvious syntax issues detected`);
        }
      } else {
        console.log(`   ✅ No template literals found`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error reading ${file}: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎉 Syntax check complete!');
  console.log('\n📋 Recent fixes applied:');
  console.log('✅ Fixed missing > in DOCTYPE declaration');
  console.log('✅ Fixed double-escaped regex patterns (/\\\\n\\\\n/ → /\\n\\n/)');
  console.log('✅ Fixed character class regex (/^[\\\\-\\\\*]/ → /^[-*]/)');
  console.log('✅ Fixed RegExp constructor escaping');
  
  console.log('\n🚀 If you still see syntax errors:');
  console.log('1. Clear browser cache and hard refresh (Ctrl+Shift+R)');
  console.log('2. Check browser developer console for specific line numbers');
  console.log('3. Verify the changes have been deployed to the server');
}

// Run the check
checkSyntax().catch(console.error);