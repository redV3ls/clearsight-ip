# Setup Guide (Web Only)

## Prerequisites

- Node.js 20+
- Wrangler CLI (optional, the project includes a local version)

## Local development

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:8787`.

## Deployment

```bash
npm run deploy
```

## Cloudflare authentication (optional)

```bash
npm run cf:login
npm run cf:whoami
```
