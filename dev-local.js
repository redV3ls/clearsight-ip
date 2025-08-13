// Local development server without Cloudflare dependencies
// Run with: node dev-local.js

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🚀 Starting local development server...');

// Set environment variables for local development
process.env.NODE_ENV = 'development';
process.env.LOG_LEVEL = 'debug';
process.env.CORS_ORIGIN = '*';
process.env.ENABLE_RATE_LIMITING = 'false';
process.env.JWT_SECRET = 'local-development-jwt-secret-key-not-for-production-use-only-with-more-entropy-12345';

// Start wrangler dev with local configuration
const wrangler = spawn('npx', ['wrangler', 'dev', '--config', 'wrangler.local.toml', '--local'], {
  stdio: 'inherit',
  shell: true
});

wrangler.on('close', (code) => {
  console.log(`\n🛑 Development server stopped with code ${code}`);
});

wrangler.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  wrangler.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  wrangler.kill('SIGTERM');
});