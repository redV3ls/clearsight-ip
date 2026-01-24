# Clearsight IP (Web)

A web-only experience served from Cloudflare Workers. No public API endpoints are exposed.

## What is included

- Landing page UI
- Legal pages (privacy, terms, DPA, data retention, privacy requests)
- Simple web-only routing

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

## Key files

- `src/index.ts` - Worker entrypoint and routes
- `src/constants/htmlContentComplete.ts` - Landing page HTML
- `src/constants/legalPages.ts` - Legal page HTML

## Notes

- All functionality is accessed via the web page.
- API routes and documentation have been removed.
