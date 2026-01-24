import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { HTML_CONTENT } from './constants/htmlContentComplete';
import { PRIVACY_POLICY_HTML, TERMS_HTML, DPA_HTML, DATA_RETENTION_HTML, DSR_HTML } from './constants/legalPages';

const app = new Hono();

app.use('*', logger());

// Basic security headers and HTML content type handling.
app.use('*', async (c, next) => {
  const csp = [
    "default-src 'self' https:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' https: data:",
    "img-src 'self' https: data:",
    "connect-src 'self' https:",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    'upgrade-insecure-requests'
  ].join('; ');

  c.header('Content-Security-Policy', csp);
  c.header('Cross-Origin-Resource-Policy', 'cross-origin');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (c.req.path === '/' || c.req.path.endsWith('.html')) {
    c.header('Content-Type', 'text/html; charset=utf-8');
  }

  await next();
});

// Public web pages
app.get('/', (c) => {
  c.header('Cache-Control', 'no-store');
  return c.html(HTML_CONTENT);
});

app.get('/privacy', (c) => c.html(PRIVACY_POLICY_HTML));
app.get('/terms', (c) => c.html(TERMS_HTML));
app.get('/dpa', (c) => c.html(DPA_HTML));
app.get('/data-retention', (c) => c.html(DATA_RETENTION_HTML));
app.get('/dsr', (c) => c.html(DSR_HTML));

// Favicon route
app.get('/favicon.ico', (c) => {
  const faviconSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <defs>
      <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' style='stop-color:#14b8a6;stop-opacity:1' />
        <stop offset='100%' style='stop-color:#2563eb;stop-opacity:1' />
      </linearGradient>
    </defs>
    <circle cx='50' cy='50' r='45' fill='url(#grad)'/>
    <path d='M30 35h40v6H30z' fill='white' opacity='0.9'/>
    <path d='M30 45h32v4H30z' fill='white' opacity='0.7'/>
    <path d='M30 53h28v4H30z' fill='white' opacity='0.5'/>
    <path d='M30 61h24v4H30z' fill='white' opacity='0.3'/>
    <path d='M65 42l8 8-8 8-3-3 5-5-5-5z' fill='white'/>
  </svg>`;

  c.header('Content-Type', 'image/svg+xml');
  c.header('Cache-Control', 'public, max-age=31536000');
  return c.body(faviconSvg);
});

// Redirect all unknown routes to home
app.notFound((c) => {
  c.header('Cache-Control', 'no-store');
  return c.redirect('/', 302);
});

export default app;
