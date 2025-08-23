import { Context, Next } from 'hono';
import { verify, sign } from 'hono/jwt';
import { AppError } from './errorHandler';
import { Env } from '../index';
import { z } from 'zod';

// Render a friendly HTML page when accessing API Docs without authentication
const renderDocsAuthErrorPage = (opts: { title?: string; message: string; code?: string; help?: string }) => {
  const title = opts.title || 'Authentication required';
  const code = opts.code || 'AUTHENTICATION_REQUIRED';
  const help = opts.help || 'Sign in to continue.';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Clearsight IP • API Docs – ${title}</title>
  <style>
    :root { --bg:#0b1020; --panel:#121a33; --accent:#4f8cff; --muted:#9fb4ff; --ok:#10b981; --err:#ef4444; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; background: linear-gradient(180deg, #0b1020 0%, #0e1730 100%); color:#e6ecff; }
    .wrap { max-width: 840px; margin: 6vh auto; padding: 24px; }
    .card { background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:28px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
    h1 { margin:0 0 8px; font-size: 28px; letter-spacing:.2px; }
    .subtitle { color:#c7d7ff; margin: 0 0 22px; font-size: 14px; opacity:.9 }
    .badge { display:inline-block; padding:4px 10px; border-radius:999px; font-weight:600; background:rgba(239,68,68,.15); color:#ffb4b4; border:1px solid rgba(239,68,68,.35); margin-bottom:12px }
    .panel { display:grid; grid-template-columns: 1fr; gap:18px; }
    .section { background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; }
    .section h3 { margin:0 0 10px; font-size:14px; color:#d7e4ff; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; font-size: 12px; }
    pre { background: #0a0f22; border:1px solid rgba(255,255,255,0.07); border-radius:8px; padding:12px; overflow:auto; color:#cfe3ff }
    .actions { margin-top:18px; display:flex; gap:12px; flex-wrap:wrap }
    .btn { appearance:none; border:1px solid rgba(255,255,255,0.12); background: #1a2447; color:#e6ecff; padding:10px 14px; border-radius:10px; text-decoration:none; font-weight:600 }
    .btn.primary { background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-color:#3b82f6 }
    .hint { color:#b9c9ff; font-size:13px; opacity:.9 }
    .footer { margin-top:22px; font-size:12px; color:#9fb4ff; opacity:.85 }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="badge">${code}</div>
      <h1>API documentation requires authentication</h1>
      <p class="subtitle">${opts.message}</p>
      <div class="panel">
        <div class="section">
          <h3>Quick options</h3>
          <div class="actions">
            <a class="btn primary" href="/">Sign in</a>
            <a class="btn" href="#api-key">Use an API key</a>
            <a class="btn" href="/api/v1">View API root</a>
          </div>
        </div>
        <div id="api-key" class="section">
          <h3>Using an API key</h3>
          <p class="hint">If you have an API key, include it in requests as the X-API-Key header. Swagger UI will remember your auth if you authorize from the UI.</p>
          <pre><code>curl -H "X-API-Key: {{YOUR_API_KEY}}" https://clearsight-ip.com/api/v1/health</code></pre>
        </div>
        <div class="section">
          <h3>Using a bearer token</h3>
          <p class="hint">If your session expired, sign in again to obtain a new token. Then open the docs and click “Authorize”.</p>
          <pre><code>Authorization: Bearer {{YOUR_JWT_TOKEN}}</code></pre>
        </div>
      </div>
      <div class="footer">Need help? See the README or contact support.</div>
    </div>
  </div>
</body>
</html>`;
};

export interface UserContext {
  id: string;
  email: string;
  role?: string;
  apiKeyId?: string;
}

export interface AuthenticatedContext extends Context<{ 
  Bindings: Env;
  Variables: {
    user: UserContext;
  };
}> {}

// RSA Key Generation Utilities
export const generateRSAKeyPair = async (): Promise<{ privateKey: string; publicKey: string }> => {
  // Generate RSA key pair using Web Crypto API
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );

  // Export private key
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));
  const privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;

  // Export public key
  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));
  const publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;

  return { privateKey, publicKey };
};

// Helper function to get RSA keys from environment or KV (persistent), otherwise generate and persist
export const getRSAKeys = async (env: Env): Promise<{ privateKey: string; publicKey: string }> => {
  // 1) Prefer explicit keys from environment (most reliable)
  if (env.JWT_PRIVATE_KEY && env.JWT_PUBLIC_KEY) {
    console.log('Using RSA keys from environment variables');
    return {
      privateKey: env.JWT_PRIVATE_KEY,
      publicKey: env.JWT_PUBLIC_KEY,
    };
  }

  console.warn('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY not found in environment, falling back to KV storage');

  // 2) Try to load a persistent keypair from KV so tokens remain verifiable across requests/instances
  try {
    const cached = await env.CACHE.get('jwt_keys');
    if (cached) {
      const parsed = JSON.parse(cached) as { privateKey: string; publicKey: string };
      if (parsed?.privateKey && parsed?.publicKey) {
        console.log('Using RSA keys from KV cache');
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read RSA keys from KV:', error);
  }

  // 3) Generate a new keypair and persist it to KV for future requests
  console.warn('Generating new RSA keys - this may invalidate existing JWT tokens');
  const keys = await generateRSAKeyPair();
  try {
    await env.CACHE.put('jwt_keys', JSON.stringify(keys), { expirationTtl: 86400 * 30 }); // 30 days
    console.log('New RSA keys generated and cached');
  } catch (error) {
    console.error('Failed to cache RSA keys to KV:', error);
    console.warn('RSA keys will be ephemeral - tokens may become invalid across worker instances');
  }
  return keys;
};

export interface ApiKeyData {
  id: string;
  name: string;
  userId: string;
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  [key: string]: any; // Add index signature for Hono compatibility
}

// Generate JWT token with RS256
export const generateJWT = async (payload: Omit<JWTPayload, 'iat' | 'exp'>, env: Env, expiresIn: number = 86400): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: any = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };
  
  try {
    // Get RSA keys for RS256 signing
    const { privateKey } = await getRSAKeys(env);
    
    // Use RS256 algorithm with private key
    return await sign(fullPayload, privateKey, 'RS256');
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new AppError('Failed to generate authentication token', 500, 'JWT_GENERATION_FAILED');
  }
};

// Verify JWT token with RS256
export const verifyJWT = async (token: string, env: Env): Promise<JWTPayload> => {
  try {
    // Get RSA keys for RS256 verification
    const { publicKey } = await getRSAKeys(env);
    
    // Use RS256 algorithm with public key
    const payload = await verify(token, publicKey, 'RS256') as JWTPayload;
    
    // Validate payload structure
    if (!payload.id || !payload.email) {
      throw new Error('Invalid JWT payload structure');
    }
    
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    
    // Provide more specific error messages for debugging
    if (error.message?.includes('expired')) {
      throw new AppError('Authentication token has expired', 401, 'EXPIRED_TOKEN');
    }
    if (error.message?.includes('signature')) {
      throw new AppError('Invalid token signature - please login again', 401, 'INVALID_SIGNATURE');
    }
    if (error.message?.includes('payload')) {
      throw new AppError('Invalid token format', 401, 'INVALID_TOKEN_FORMAT');
    }
    
    throw new AppError('Invalid or expired authentication token', 401, 'INVALID_TOKEN');
  }
};

// Generate API key
export const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sk_';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate API key format
const apiKeySchema = z.string().regex(/^sk_[A-Za-z0-9]{48}$/, 'Invalid API key format');

// Store API key in KV
export const storeApiKey = async (kv: KVNamespace, apiKey: string, data: ApiKeyData): Promise<void> => {
  const keyData = {
    ...data,
    hashedKey: await hashApiKey(apiKey),
  };
  
  await kv.put(`api_key:${apiKey}`, JSON.stringify(keyData), {
    expirationTtl: data.expiresAt ? Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000) : undefined,
  });
  
  // Also store by user ID for easy lookup
  const userKeys = await getUserApiKeys(kv, data.userId);
  userKeys.push(apiKey);
  await kv.put(`user_api_keys:${data.userId}`, JSON.stringify(userKeys));
};

// Get API key data
export const getApiKeyData = async (kv: KVNamespace, apiKey: string): Promise<ApiKeyData | null> => {
  const data = await kv.get(`api_key:${apiKey}`);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data) as ApiKeyData & { hashedKey: string };
    // Verify the key hash matches
    const isValid = await verifyApiKey(apiKey, parsed.hashedKey);
    if (!isValid) return null;
    
    // Update last used timestamp
    parsed.lastUsed = new Date().toISOString();
    await kv.put(`api_key:${apiKey}`, JSON.stringify(parsed));
    
    // Remove hashedKey from response
    const { hashedKey, ...result } = parsed;
    return result;
  } catch {
    return null;
  }
};

// Get user's API keys
export const getUserApiKeys = async (kv: KVNamespace, userId: string): Promise<string[]> => {
  const data = await kv.get(`user_api_keys:${userId}`);
  return data ? JSON.parse(data) : [];
};

// Hash API key for storage
const hashApiKey = async (apiKey: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Verify API key against hash
const verifyApiKey = async (apiKey: string, hash: string): Promise<boolean> => {
  const computedHash = await hashApiKey(apiKey);
  return computedHash === hash;
};

// Main authentication middleware
export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  try {
    // Skip auth for health checks and public endpoints
    const publicPaths = ['/health', '/api/v1/auth/login', '/api/v1/auth/register'];
    const isPublicPath = publicPaths.some(path => c.req.path.startsWith(path)) || c.req.path === '/';
    if (isPublicPath) {
      return next();
    }

    const apiKey = c.req.header('X-API-Key');
    const authHeader = c.req.header('Authorization');
    
    // Check for auth token in cookies first
    const cookieHeader = c.req.header('Cookie');
    let authToken = null;
    if (cookieHeader) {
      console.log('Cookie header found:', cookieHeader);
      const cookies = cookieHeader.split(';').map(c => c.trim());
      console.log('Parsed cookies:', cookies);
      const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
      console.log('Auth cookie found:', authCookie);
      if (authCookie) {
        authToken = authCookie.split('=')[1];
        console.log('Auth token extracted:', authToken ? 'TOKEN_PRESENT' : 'TOKEN_EMPTY');
      }
    } else {
      console.log('No cookie header found');
    }

    console.log('Auth check - API Key:', !!apiKey, 'Auth Header:', !!authHeader, 'Auth Token:', !!authToken);

    if (!apiKey && !authHeader && !authToken) {
      console.log('Authentication failed - no valid credentials found');
      if (c.req.path.startsWith('/api/v1/docs')) {
        const html = renderDocsAuthErrorPage({
          message: 'You must be signed in to view the API documentation.',
          code: 'AUTHENTICATION_REQUIRED',
          help: 'Please sign in or provide an API key.'
        });
        return c.html(html, 401);
      }
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    // API key authentication
    if (apiKey) {
      try {
        // Validate API key format
        apiKeySchema.parse(apiKey);
        
        // Ensure KV namespace is available
        if (!c.env?.CACHE) {
          throw new AppError('Cache service unavailable', 500, 'SERVICE_UNAVAILABLE');
        }
        
        const apiKeyData = await getApiKeyData(c.env.CACHE, apiKey);
        if (!apiKeyData || !apiKeyData.isActive) {
          throw new AppError('Invalid or inactive API key', 401, 'INVALID_API_KEY');
        }
        
        // Check expiration
        if (apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < new Date()) {
          throw new AppError('API key has expired', 401, 'EXPIRED_API_KEY');
        }
        
        // Set user context from API key using Hono's context methods
        const user = {
          id: apiKeyData.userId,
          email: '', // API keys don't have email context
          role: apiKeyData.permissions.includes('admin') ? 'admin' : 'user',
          apiKeyId: apiKeyData.id,
        };
        c.set('user', user);
        
        return next();
      } catch (error) {
        if (c.req.path.startsWith('/api/v1/docs')) {
          const html = renderDocsAuthErrorPage({
            message: 'The API key provided is invalid or has insufficient permissions.',
            code: error instanceof z.ZodError ? 'INVALID_API_KEY_FORMAT' : (error instanceof AppError ? error.code : 'INVALID_API_KEY')
          });
          return c.html(html, 401);
        }
        if (error instanceof z.ZodError) {
          throw new AppError('Invalid API key format', 401, 'INVALID_API_KEY_FORMAT');
        }
        if (error instanceof AppError) {
          throw error;
        }
        console.error('API key authentication error:', error);
        throw new AppError('Authentication failed', 500, 'AUTH_ERROR');
      }
    }

    // JWT token authentication (from cookie or Authorization header)
    let token = authToken; // From cookie
    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7); // From Authorization header
    }
    
    console.log('JWT token for verification:', token ? 'TOKEN_PRESENT' : 'NO_TOKEN');
    
    if (token) {
      
      try {
        // Attempt JWT verification using keys from env or KV (handled inside verifyJWT/getRSAKeys)
        console.log('Attempting JWT verification...');
        const payload = await verifyJWT(token, c.env);
        console.log('JWT verification successful, payload:', { id: payload.id, email: payload.email });
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          throw new AppError('Token has expired', 401, 'EXPIRED_TOKEN');
        }
        
        // Set user context using Hono's context methods
        const user = {
          id: payload.id,
          email: payload.email,
          role: payload.role,
        };
        c.set('user', user);
        
        return next();
      } catch (error) {
        // For the docs page, return a friendly HTML error instead of JSON
        if (c.req.path.startsWith('/api/v1/docs')) {
          const isExpired = (error instanceof AppError && error.code === 'EXPIRED_TOKEN') || error.message?.includes('expired');
          const html = renderDocsAuthErrorPage({
            message: isExpired ? 'Your session has expired. Please sign in again to view the API documentation.' : 'Authentication failed. Please sign in or use a valid API key.',
            code: isExpired ? 'EXPIRED_TOKEN' : (error instanceof AppError ? error.code : 'INVALID_TOKEN')
          });
          return c.html(html, 401);
        }
        if (error instanceof AppError) {
          throw error;
        }
        // Handle specific JWT errors
        if (error.message?.includes('expired')) {
          throw new AppError('Token has expired', 401, 'EXPIRED_TOKEN');
        }
        if (error.message?.includes('Invalid token') || error.message?.includes('signature')) {
          throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
        }
        throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
      }
    }

    throw new AppError('Invalid authentication method', 401, 'INVALID_AUTH_METHOD');
  } catch (error) {
    // Ensure all errors are properly handled and don't leak as 500s
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Authentication middleware error:', error);
    throw new AppError('Authentication failed', 500, 'AUTH_ERROR');
  }
};

// Require authentication middleware
export const requireAuth = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const user = c.get('user');
  if (!user) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }
  return next();
};

// Require specific role middleware
export const requireRole = (role: string) => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const user = c.get('user');
    if (!user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }
    
    if (user.role !== role && user.role !== 'admin') {
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }
    
    return next();
  };
};

// Require specific permissions middleware
export const requirePermissions = (permissions: string[]) => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const user = c.get('user');
    if (!user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }
    
    // If using API key, check permissions
    if (user.apiKeyId) {
      try {
        if (!c.env?.CACHE) {
          throw new AppError('Cache service unavailable', 500, 'SERVICE_UNAVAILABLE');
        }
        
        const apiKeyData = await getApiKeyData(c.env.CACHE, c.req.header('X-API-Key')!);
        if (!apiKeyData) {
          throw new AppError('Invalid API key', 401, 'INVALID_API_KEY');
        }
        
        const hasPermissions = permissions.every(perm => 
          apiKeyData.permissions.includes(perm) || apiKeyData.permissions.includes('admin')
        );
        
        if (!hasPermissions) {
          throw new AppError('Insufficient API key permissions', 403, 'INSUFFICIENT_API_PERMISSIONS');
        }
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        console.error('Permission check error:', error);
        throw new AppError('Permission check failed', 500, 'PERMISSION_ERROR');
      }
    }
    
    return next();
  };
};