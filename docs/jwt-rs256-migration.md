# JWT RS256 Migration Guide

## Overview

This application has been upgraded to use RS256 (RSA with SHA-256) for JWT token signing and verification, replacing the previous HS256 (HMAC with SHA-256) implementation. This provides enhanced security through asymmetric cryptography.

## What Changed

### Before (HS256)
- Used symmetric key (shared secret)
- Same key for signing and verification
- Less secure but simpler to implement

### After (RS256)
- Uses asymmetric key pair (public/private keys)
- Private key for signing, public key for verification
- More secure and industry standard

## Security Benefits

1. **Key Separation**: Private key stays secure on the server, public key can be shared
2. **Non-repudiation**: Only the holder of the private key can sign tokens
3. **Scalability**: Public key can be distributed to multiple services for verification
4. **Industry Standard**: RS256 is the recommended algorithm for production JWT implementations

## Environment Variables

### Required for Production

```bash
# RSA Private Key (PEM format) - Keep this secure!
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"

# RSA Public Key (PEM format) - Safe to share
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr7eUkp...
-----END PUBLIC KEY-----"
```

### Legacy (Backward Compatibility)
```bash
# Still supported but deprecated
JWT_SECRET="your-legacy-secret"
```

## Key Generation

### Option 1: Use the provided script
```bash
node scripts/generate-rsa-keys.js
```

### Option 2: Manual generation with OpenSSL
```bash
# Generate private key
openssl genpkey -algorithm RSA -out private_key.pem -pkcs8 -pass pass:your_password

# Generate public key
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

### Option 3: Node.js crypto module
```javascript
const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
```

## Deployment

### Cloudflare Workers

Add to your `wrangler.toml`:

```toml
[vars]
JWT_PRIVATE_KEY = """
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
"""

JWT_PUBLIC_KEY = """
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr7eUkp...
-----END PUBLIC KEY-----
"""
```

### Other Platforms

Set environment variables through your platform's configuration:

- **Heroku**: `heroku config:set JWT_PRIVATE_KEY="..."`
- **AWS Lambda**: Set in environment variables
- **Docker**: Use environment files or secrets
- **Kubernetes**: Use ConfigMaps or Secrets

## Migration Impact

### Existing Tokens
- All existing HS256 tokens will become invalid
- Users will need to log in again after deployment
- This is expected and necessary for the security upgrade

### API Compatibility
- All API endpoints remain the same
- Token format remains standard JWT
- Only the signing algorithm changes

## Development vs Production

### Development
- If RSA keys are not provided, the system will generate temporary keys
- This is convenient for development but not recommended for production
- Warning messages will be logged

### Production
- RSA keys MUST be provided via environment variables
- Keys should be generated securely and stored safely
- Private key must never be exposed or committed to version control

## Security Best Practices

1. **Private Key Security**
   - Never commit private keys to version control
   - Use secure environment variable management
   - Rotate keys periodically (recommended: annually)
   - Use different keys for different environments

2. **Key Storage**
   - Use your platform's secure secret management
   - Consider using hardware security modules (HSMs) for high-security environments
   - Implement proper access controls

3. **Monitoring**
   - Monitor for JWT verification failures
   - Set up alerts for authentication anomalies
   - Log key usage for audit purposes

## Troubleshooting

### Common Issues

1. **"Invalid or expired token" errors**
   - Check that RSA keys are properly formatted
   - Ensure keys match between signing and verification
   - Verify environment variables are set correctly

2. **"JWT service unavailable" errors**
   - Check that RSA keys are provided in environment
   - Verify key format (PEM with proper headers/footers)

3. **Performance concerns**
   - RS256 is slightly slower than HS256 but negligible for most applications
   - Consider caching public keys if doing high-volume verification

### Debug Mode

Enable debug logging to see detailed JWT operations:

```bash
LOG_LEVEL=debug
```

## Testing

The application includes comprehensive tests for both HS256 (legacy) and RS256 implementations. Run tests with:

```bash
npm test
```

## Support

For questions or issues related to the JWT RS256 migration, please:

1. Check the troubleshooting section above
2. Review the application logs for specific error messages
3. Ensure environment variables are properly configured
4. Verify RSA key format and validity

## References

- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [RFC 7518 - JSON Web Algorithms (JWA)](https://tools.ietf.org/html/rfc7518)
- [JWT.io - JWT Debugger](https://jwt.io/)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)