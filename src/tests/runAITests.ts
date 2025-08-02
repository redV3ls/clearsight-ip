#!/usr/bin/env node

/**
 * AI Services Test Runner
 * 
 * This script runs comprehensive tests for AI-powered CV analysis services.
 * It includes unit tests, integration tests, and quality validation tests.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message: string) {
  log(`\n${colors.bright}${colors.blue}=== ${message} ===${colors.reset}`);
}

function logSuccess(message: string) {
  log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message: string) {
  log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logWarning(message: string) {
  log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function runCommand(command: string, description: string): boolean {
  try {
    log(`\n${colors.cyan}Running: ${description}${colors.reset}`);
    log(`Command: ${command}`);
    
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    if (output.trim()) {
      log(output);
    }
    
    logSuccess(`${description} completed successfully`);
    return true;
  } catch (error: any) {
    logError(`${description} failed`);
    if (error.stdout) {
      log(`STDOUT: ${error.stdout}`);
    }
    if (error.stderr) {
      log(`STDERR: ${error.stderr}`);
    }
    return false;
  }
}

function checkPrerequisites(): boolean {
  logHeader('Checking Prerequisites');
  
  const requiredFiles = [
    'src/tests/deepseekAI.test.ts',
    'src/tests/aiAnalysisService.test.ts',
    'src/tests/aiAnalysisPipeline.integration.test.ts',
    'src/tests/aiQualityValidation.test.ts'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (existsSync(file)) {
      logSuccess(`Found: ${file}`);
    } else {
      logError(`Missing: ${file}`);
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    logError('Some required test files are missing. Please ensure all AI test files are present.');
    return false;
  }
  
  // Check if vitest is available
  try {
    execSync('npx vitest --version', { stdio: 'pipe' });
    logSuccess('Vitest is available');
  } catch (error) {
    logError('Vitest is not available. Please run: npm install');
    return false;
  }
  
  return true;
}

function runAITests(): boolean {
  logHeader('Running AI Service Tests');
  
  const testSuites = [
    {
      pattern: 'src/tests/deepseekAI.test.ts',
      description: 'DeepSeek AI Service Unit Tests'
    },
    {
      pattern: 'src/tests/aiAnalysisService.test.ts',
      description: 'AI Analysis Service Integration Tests'
    },
    {
      pattern: 'src/tests/aiAnalysisPipeline.integration.test.ts',
      description: 'AI Analysis Pipeline End-to-End Tests'
    },
    {
      pattern: 'src/tests/aiQualityValidation.test.ts',
      description: 'AI Quality Validation Tests'
    }
  ];
  
  let allTestsPassed = true;
  
  for (const suite of testSuites) {
    const success = runCommand(
      `npx vitest run ${suite.pattern} --reporter=verbose`,
      suite.description
    );
    
    if (!success) {
      allTestsPassed = false;
    }
  }
  
  return allTestsPassed;
}

function runCoverageReport(): boolean {
  logHeader('Generating Coverage Report for AI Services');
  
  const aiTestFiles = [
    'src/tests/deepseekAI.test.ts',
    'src/tests/aiAnalysisService.test.ts',
    'src/tests/aiAnalysisPipeline.integration.test.ts',
    'src/tests/aiQualityValidation.test.ts'
  ].join(' ');
  
  return runCommand(
    `npx vitest run ${aiTestFiles} --coverage --coverage.include="src/services/deepseekAI.ts" --coverage.include="src/services/aiAnalysisService.ts" --coverage.include="src/config/ai.ts"`,
    'AI Services Coverage Report'
  );
}

function displaySummary(testsResult: boolean, coverageResult: boolean) {
  logHeader('Test Summary');
  
  if (testsResult) {
    logSuccess('All AI service tests passed');
  } else {
    logError('Some AI service tests failed');
  }
  
  if (coverageResult) {
    logSuccess('Coverage report generated successfully');
  } else {
    logWarning('Coverage report generation had issues');
  }
  
  log('\n' + colors.bright + 'AI Services Test Results:' + colors.reset);
  log(`Tests: ${testsResult ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  log(`Coverage: ${coverageResult ? colors.green + 'GENERATED' : colors.yellow + 'PARTIAL'}${colors.reset}`);
  
  if (!testsResult) {
    log('\n' + colors.yellow + 'Note: Some tests may require a valid DeepSeek API key to pass.' + colors.reset);
    log(colors.yellow + 'Set DEEPSEEK_API_KEY environment variable for full integration testing.' + colors.reset);
  }
}

function main() {
  log(colors.bright + colors.magenta + '🤖 AI Services Test Runner' + colors.reset);
  log('This script runs comprehensive tests for AI-powered CV analysis services.\n');
  
  // Check if API key is available
  if (process.env.DEEPSEEK_API_KEY) {
    logSuccess('DeepSeek API key is available - full integration tests will run');
  } else {
    logWarning('DeepSeek API key not found - tests will use mocked responses');
    logWarning('Set DEEPSEEK_API_KEY environment variable for full integration testing');
  }
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  
  // Run tests
  const testsResult = runAITests();
  
  // Generate coverage report
  const coverageResult = runCoverageReport();
  
  // Display summary
  displaySummary(testsResult, coverageResult);
  
  // Exit with appropriate code
  process.exit(testsResult ? 0 : 1);
}

// Run the script if called directly
if (require.main === module) {
  main();
}

export { main as runAITests };