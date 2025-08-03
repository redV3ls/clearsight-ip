#!/usr/bin/env node

/**
 * RSA Key Generation Script for JWT RS256
 * 
 * This script generates RSA key pairs for use with JWT RS256 signing.
 * Run this script to generate keys for production deployment.
 * 
 * Usage:
 *   node scripts/generate-rsa-keys.js
 * 
 * The script will output:
 * - JWT_PRIVATE_KEY: RSA private key for signing JWTs
 * - JWT_PUBLIC_KEY: RSA public key for verifying JWTs
 * 
 * Set these as environment variables in your production environment.
 */

const crypto = require('crypto');

async function generateRSAKeyPair() {
  console.log('🔐 Generating RSA key pair for JWT RS256...\n');

  try {
    // Generate RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    console.log('✅ RSA key pair generated successfully!\n');
    
    console.log('📋 Environment Variables for Production:\n');
    console.log('JWT_PRIVATE_KEY=');
    console.log(privateKey);
    console.log('\nJWT_PUBLIC_KEY=');
    console.log(publicKey);
    
    console.log('\n🔒 Security Notes:');
    console.log('- Keep the private key secure and never expose it publicly');
    console.log('- The public key can be shared safely');
    console.log('- Store these keys as environment variables in your deployment');
    console.log('- For Cloudflare Workers, add them to your wrangler.toml [vars] section');
    
    console.log('\n📝 Cloudflare Workers Setup:');
    console.log('Add to your wrangler.toml:');
    console.log('[vars]');
    console.log('JWT_PRIVATE_KEY = """');
    console.log(privateKey.trim());
    console.log('"""');
    console.log('JWT_PUBLIC_KEY = """');
    console.log(publicKey.trim());
    console.log('"""');

  } catch (error) {
    console.error('❌ Error generating RSA key pair:', error);
    process.exit(1);
  }
}

// Run the key generation
generateRSAKeyPair();