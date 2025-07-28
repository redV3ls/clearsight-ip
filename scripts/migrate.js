// Simple migration runner for Cloudflare D1
// Run with: wrangler d1 execute skill-gap-db --file=./src/db/migrations/001_add_resume_analysis_tables.sql --env production

const fs = require('fs');
const path = require('path');

console.log('To run the database migration, execute:');
console.log('npx wrangler d1 execute skill-gap-db --file=./src/db/migrations/001_add_resume_analysis_tables.sql --env production');
console.log('');
console.log('Migration file contents:');
console.log('========================');

const migrationPath = path.join(__dirname, '../src/db/migrations/001_add_resume_analysis_tables.sql');
const migrationContent = fs.readFileSync(migrationPath, 'utf8');
console.log(migrationContent);