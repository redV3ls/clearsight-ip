#!/usr/bin/env node

/**
 * Generate RSA key pair for JWT signing
 * This script generates a consistent RSA key pair that can be used
 * for JWT token signing and verification across all worker instances.
 */

const crypto = require('crypto');

async function generateRSAKeyPair() {
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

    console.log('=== RSA Key Pair Generated ===\n');
    
    console.log('Private Key (JWT_PRIVATE_KEY):');
    console.log(privateKey);
    
    console.log('\nPublic Key (JWT_PUBLIC_KEY):');
    console.log(publicKey);
    
    console.log('\n=== Wrangler Commands ===');
    console.log('Run these commands to set the secrets:');
    console.log('\nwrangler secret put JWT_PRIVATE_KEY');
    console.log('# Then paste the private key when prompted');
    console.log('\nwrangler secret put JWT_PUBLIC_KEY');
    console.log('# Then paste the public key when prompted');
    
    console.log('\n=== Environment Variables ===');
    console.log('Or add these to your .env file for local development:');
    console.log(`JWT_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`);
    console.log(`JWT_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`);

  } catch (error) {
    console.error('Error generating RSA key pair:', error);
    process.exit(1);
  }
}

generateRSAKeyPair();