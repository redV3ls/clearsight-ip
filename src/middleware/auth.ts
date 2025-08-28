import { Context, Next } from 'hono';
import { verify, sign } from 'hono/jwt';
import { AppError } from './errorHandler';
import { Env } from '../index';
import { z } from 'zod';

// Render a friendly HTML page when accessing API Docs without authentication
const renderDocsAuthErrorPage = (opts: { title?: string; message: string; code?: string; help?: string }) => {
  const title = opts.title || 'Authentication required';
  const code = opts.code || 'AUTHENTICATION_REQUIRED';
  const codeLabel = code === 'EXPIRED_TOKEN' ? 'AUTHENTICATION_REQUIRED' : code; // avoid exposing expired state
  const help = opts.help || 'Sign in to continue.';
  const msg = /expired/i.test(opts.message || '') ? 'Please sign in to view the API documentation.' : (opts.message || 'Please sign in to view the API documentation.');
  return '<!DOCTYPE html>' +
  '<html lang="en">' +
  '<head>' +
  '  <meta charset="utf-8" />' +
  '  <meta name="viewport" content="width=device-width, initial-scale=1" />' +
  '  <title>Clearsight IP • API Docs – ' + title + '</title>' +
  '  <link rel="icon" type="image/svg+xml" href="/favicon.ico" />' +
  '  <link rel="preconnect" href="https://fonts.googleapis.com" />' +
  '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
  '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />' +
  '  <style>' +
  '    :root { --primary:#14b8a6; --bg:#0f172a; --panel:#1e293b; --muted:#cbd5e1; --border:#334155; --danger:#ef4444; }' +
  '    *{ box-sizing:border-box } body{ margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#e2e8f0; background: radial-gradient(1200px 600px at 20% -10%, rgba(20,184,166,.15), transparent), linear-gradient(180deg, #0f172a 0%, #0b1224 100%); }' +
  '    .nav{ position:sticky; top:0; background:#111827; border-bottom:1px solid #1f2937; padding:12px 20px; display:flex; align-items:center; justify-content:space-between }' +
  '    .brand{ color:var(--primary); font-weight:700; letter-spacing:.2px; text-decoration:none }' +
  '    .nav a{ color:#cbd5e1; text-decoration:none; margin-left:14px } .nav a:hover{ color:var(--primary) }' +
  '    .container{ max-width:980px; margin:8vh auto; padding:0 20px }' +
  '    .hero{ display:grid; grid-template-columns: 1fr; gap:28px; align-items:stretch }' +
  '    .card{ background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:28px; box-shadow:0 10px 30px rgba(0,0,0,.35) }' +
  '    h1{ font-size:32px; margin:0 0 10px } .lead{ color:#cbd5e1; margin:0 0 18px }' +
  '    .badge{ display:inline-block; padding:4px 10px; border-radius:999px; font-weight:700; font-size:12px; background:rgba(239,68,68,.15); color:#fecaca; border:1px solid rgba(239,68,68,.35); margin-bottom:12px }' +
  '    .actions{ display:flex; gap:12px; flex-wrap:wrap; margin-top:16px }' +
  '    .btn{ appearance:none; border:1px solid var(--border); background:#1f2937; color:#e2e8f0; padding:12px 16px; border-radius:10px; text-decoration:none; font-weight:700 } .btn:hover{ border-color:var(--primary); color:var(--primary) }' +
  '    .btn.primary{ background:linear-gradient(180deg, #14b8a6, #0d9488); border-color:transparent; color:#0b1020 } .btn.primary:hover{ filter:brightness(1.05) }' +
  '    .section{ background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-top:14px }' +
  '    .section h3{ margin:0 0 8px; font-size:14px; color:#d1d5db }' +
  '    pre{ background:#0a1222; border:1px solid #1f2937; border-radius:8px; padding:12px; overflow:auto; color:#c7d2fe; font-size:12px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace }' +
  '    .footer{ margin-top:26px; color:#94a3b8; font-size:12px; text-align:center }' +
  '    /* Inline auth modal styles */' +
  '    .overlay{ position:fixed; inset:0; background:rgba(0,0,0,.6); display:none; align-items:center; justify-content:center; z-index:9999 }' +
  '    .modal{ width:420px; max-width:92vw; background:var(--panel); border:1px solid rgba(255,255,255,.08); border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,.5) }' +
  '    .modal .hd{ padding:16px 18px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:space-between }' +
  '    .modal h2{ margin:0; font-size:18px; color:var(--primary) }' +
  '    .close{ border:none; background:transparent; color:#cbd5e1; font-size:18px; cursor:pointer }' +
  '    .tabs{ display:flex; gap:8px; background:#1f2a44; padding:6px; border-radius:10px; margin:14px 0 }' +
  '    .tab{ flex:1; padding:10px 12px; border-radius:8px; border:1px solid transparent; color:#cbd5e1; background:transparent; cursor:pointer; font-weight:600 }' +
  '    .tab.active{ background:var(--primary); color:#0b1020 }' +
  '    .bd{ padding:18px }' +
  '    .field{ margin-bottom:12px }' +
  '    .label{ display:block; font-size:12px; color:#cbd5e1; margin:0 0 6px }' +
  '    .input{ width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:#1f2937; color:#e6ecff }' +
  '    .btn.block{ width:100%; justify-content:center; display:inline-flex; align-items:center }' +
  '    .error{ background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.35); color:#fecaca; padding:10px 12px; border-radius:8px; margin-bottom:10px; display:none }' +
  '  </style>' +
  '</head>' +
  '<body>' +
  '  <header class="nav">' +
  '    <a class="brand" href="/">Clearsight IP</a>' +
  '    <div class="right">' +
  '      <a href="/">Home</a>' +
  '      <a href="/api/v1">API Root</a>' +
  '      <a href="/docs">API Docs</a>' +
  '    </div>' +
  '  </header>' +
  '  <main class="container">' +
  '    <div class="hero">' +
  '      <section class="card">' +
  '        <div class="badge">' + codeLabel + '</div>' +
  '        <h1>Access to API Docs requires sign-in</h1>' +
  '        <p class="lead">' + msg + '</p>' +
  '        <div class="section">' +
  '          <h3>Quick actions</h3>' +
  '          <div class="actions">' +
'            <button id="open-login-btn" class="btn primary">Log in</button>' +
  '          </div>' +
  '        </div>' +
  '        <div class="section" id="api-key">' +
  '          <h3>Using an API key</h3>' +
  '          <p style="color:#a3b8ff; font-size:13px; margin:6px 0 10px">Click “Authorize” in the docs UI and paste your key in the X-API-Key field. Or call endpoints directly:</p>' +
  '          <pre><code>curl -H "X-API-Key: {{YOUR_API_KEY}}" https://clearsight-ip.com/api/v1/health</code></pre>' +
  '        </div>' +
  '        <div class="section">' +
  '          <h3>Using a bearer token</h3>' +
  '          <p style="color:#a3b8ff; font-size:13px; margin:6px 0 10px">Sign in to obtain a token, then click “Authorize”.</p>' +
  '          <pre><code>Authorization: Bearer {{YOUR_JWT_TOKEN}}</code></pre>' +
  '        </div>' +
  '        <div class="footer">Need help? See the README or contact support.</div>' +
  '      </section>' +
  '    </div>' +
  '  </main>' +
  "  <div id=\"authOverlay\" class=\"overlay\" role=\"dialog\" aria-modal=\"true\" aria-hidden=\"true\">" +
  "    <div class=\"modal\">" +
  "      <div class=\"hd\">" +
  "        <h2>Account Access</h2>" +
  "        <button id=\"closeAuth\" class=\"close\" aria-label=\"Close\">×</button>" +
  "      </div>" +
  "      <div class=\"bd\">" +
  "        <div class=\"tabs\">" +
  "          <button id=\"docsLoginTab\" class=\"tab active\">Login</button>" +
  "          <button id=\"docsRegisterTab\" class=\"tab\">Sign Up</button>" +
  "        </div>" +
  "        <div id=\"docsAuthError\" class=\"error\"></div>" +
  "        <form id=\"docsLoginForm\" autocomplete=\"on\">" +
  "          <div class=\"field\">" +
  "            <label class=\"label\">Email</label>" +
  "            <input type=\"email\" name=\"email\" required class=\"input\" />" +
  "          </div>" +
  "          <div class=\"field\">" +
  "            <label class=\"label\">Password</label>" +
  "            <input type=\"password\" name=\"password\" required class=\"input\" />" +
  "          </div>" +
  "          <button type=\"submit\" class=\"btn primary block\">Log in</button>" +
  "        </form>" +
  "        <form id=\"docsRegisterForm\" style=\"display:none\" autocomplete=\"on\">" +
  "          <div class=\"field\">" +
  "            <label class=\"label\">Email</label>" +
  "            <input type=\"email\" name=\"email\" required class=\"input\" />" +
  "          </div>" +
  "          <div class=\"field\">" +
  "            <label class=\"label\">Password</label>" +
  "            <input type=\"password\" name=\"password\" minlength=\"8\" required class=\"input\" />" +
  "          </div>" +
  "          <button type=\"submit\" class=\"btn primary block\">Create account</button>" +
  "        </form>" +
  "      </div>" +
  "    </div>" +
  "  </div>" +
  "  <script>" +
  "    (function(){" +
  "      var overlay = document.getElementById('authOverlay');" +
  "      var openBtn = document.getElementById('open-login-btn');" +
  "      var closeBtn = document.getElementById('closeAuth');" +
  "      var loginTab = document.getElementById('docsLoginTab');" +
  "      var registerTab = document.getElementById('docsRegisterTab');" +
  "      var loginForm = document.getElementById('docsLoginForm');" +
  "      var registerForm = document.getElementById('docsRegisterForm');" +
  "      var errorBox = document.getElementById('docsAuthError');" +
  "      function showOverlay(){ overlay.style.display='flex'; document.body.style.overflow='hidden'; }" +
  "      function hideOverlay(){ overlay.style.display='none'; document.body.style.overflow=''; }" +
  "      function clearError(){ if(errorBox){ errorBox.style.display='none'; errorBox.textContent=''; } }" +
  "      function showError(msg){ if(errorBox){ errorBox.textContent=msg||'Authentication failed'; errorBox.style.display='block'; } }" +
  "      function setTab(mode){ if(mode==='login'){ loginTab.classList.add('active'); registerTab.classList.remove('active'); loginForm.style.display='block'; registerForm.style.display='none'; } else { registerTab.classList.add('active'); loginTab.classList.remove('active'); loginForm.style.display='none'; registerForm.style.display='block'; } clearError(); }" +
  "      openBtn && openBtn.addEventListener('click', function(e){ e.preventDefault(); setTab('login'); showOverlay(); });" +
  "      closeBtn && closeBtn.addEventListener('click', function(){ hideOverlay(); });" +
  "      overlay && overlay.addEventListener('click', function(e){ if(e.target===overlay) hideOverlay(); });" +
  "      loginTab && loginTab.addEventListener('click', function(){ setTab('login'); });" +
  "      registerTab && registerTab.addEventListener('click', function(){ setTab('register'); });" +
  "      if(loginForm){ loginForm.addEventListener('submit', async function(e){ e.preventDefault(); clearError(); var data=new FormData(loginForm); var email=data.get('email'); var password=data.get('password'); var btn=loginForm.querySelector('button[type=submit]'); var prev=btn.textContent; btn.textContent='Logging in...'; btn.disabled=true; try{ var res=await fetch('/api/v1/auth/login',{ method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email: email, password: password })}); var json=await res.json(); if(res.ok && json.success){ location.reload(); } else { showError(json?.error?.message || 'Invalid email or password'); } } catch(err){ showError('Network error. Please try again.'); } finally { btn.textContent=prev; btn.disabled=false; } }); }" +
  "      if(registerForm){ registerForm.addEventListener('submit', async function(e){ e.preventDefault(); clearError(); var data=new FormData(registerForm); var email=data.get('email'); var password=data.get('password'); var btn=registerForm.querySelector('button[type=submit]'); var prev=btn.textContent; btn.textContent='Creating account...'; btn.disabled=true; try{ var res=await fetch('/api/v1/auth/register',{ method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email: email, password: password, name: String(email||'').split('@')[0] })}); var json=await res.json(); if((res.ok && json.success) || res.status===201){ location.reload(); } else { showError(json?.error?.message || 'Registration failed.'); } } catch(err){ showError('Network error. Please try again.'); } finally { btn.textContent=prev; btn.disabled=false; } }); }" +
  "    })();" +
  "  </script>" +
  '</body>' +
  '</html>';
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

// Module-scoped in-memory cache for RSA keys to avoid repeated KV reads
let IN_MEMORY_RSA_KEYS: { privateKey: string; publicKey: string } | null = null;

// Helper function to get RSA keys from environment or KV (persistent), otherwise generate and persist
export const getRSAKeys = async (env: Env): Promise<{ privateKey: string; publicKey: string }> => {
  // 0) Module memory cache (warm isolate)
  if (IN_MEMORY_RSA_KEYS?.privateKey && IN_MEMORY_RSA_KEYS?.publicKey) {
    return IN_MEMORY_RSA_KEYS;
  }

  // 1) Prefer explicit keys from environment (most reliable)
  if (env.JWT_PRIVATE_KEY && env.JWT_PUBLIC_KEY) {
    console.log('Using RSA keys from environment variables');
    const keys = {
      privateKey: env.JWT_PRIVATE_KEY,
      publicKey: env.JWT_PUBLIC_KEY,
    };
    IN_MEMORY_RSA_KEYS = keys;
    return keys;
  }

  console.warn('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY not found in environment, falling back to KV storage');

  // 2) Try to load a persistent keypair from KV so tokens remain verifiable across requests/instances
  try {
    const cached = await env.CACHE.get('jwt_keys');
    if (cached) {
      const parsed = JSON.parse(cached) as { privateKey: string; publicKey: string };
      if (parsed?.privateKey && parsed?.publicKey) {
        console.log('Using RSA keys from KV cache');
        IN_MEMORY_RSA_KEYS = parsed;
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
  IN_MEMORY_RSA_KEYS = keys;
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