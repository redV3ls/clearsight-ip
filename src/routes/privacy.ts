import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../index';
import { GDPRExportService } from '../services/gdprExportService';
import { SecureGDPRDeletionService } from '../services/gdprDeletionService';
import { DatabaseManager } from '../config/database';

const privacy = new Hono<{ Bindings: Env }>();

const dsrSchema = z.object({
  type: z.enum(['access', 'export', 'delete', 'rectify', 'opt_out']),
  details: z.string().max(4000).optional()
});

const dsrPublicSchema = z.object({
  type: z.enum(['access', 'export', 'delete', 'rectify', 'opt_out']),
  email: z.string().email(),
  details: z.string().max(4000).optional()
});

// Authenticated DSR endpoint (requires auth middleware upstream)
privacy.post('/dsr', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } }, 401);

    const body = await c.req.json().catch(() => ({}));
    const parsed = dsrSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: parsed.error.flatten() } }, 400);
    }

    const { type, details } = parsed.data;

    if (type === 'export' || type === 'access') {
      const exportService = new GDPRExportService(c.env);
      const req = await exportService.requestDataExport(user.id, 'json');
      return c.json({ success: true, request: req });
    }

    if (type === 'delete') {
      const db = DatabaseManager.initialize(c.env.DB);
      const deletionService = new SecureGDPRDeletionService(db, c.env);
      await deletionService.scheduleGracePeriodDeletion(user.id);
      return c.json({ success: true, message: 'Deletion scheduled with grace period. Check your email for confirmation details.' });
    }

    // rectify / opt_out -> store request for support follow-up
    const id = crypto.randomUUID();
    const payload = { id, userId: user.id, type, details: details || '', createdAt: new Date().toISOString() };
    await c.env.CACHE.put(`dsr:auth:${id}`, JSON.stringify(payload), { expirationTtl: 60 * 60 * 24 * 30 });
    return c.json({ success: true, requestId: id });
  } catch (err) {
    return c.json({ success: false, error: { code: 'DSR_ERROR', message: 'Failed to submit request' } }, 500);
  }
});

// Public DSR endpoint (no auth required) - for non-logged-in users
privacy.post('/dsr-public', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const parsed = dsrPublicSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: parsed.error.flatten() } }, 400);
    }
    const { type, email, details } = parsed.data;
    const id = crypto.randomUUID();
    const payload = { id, type, email, details: details || '', createdAt: new Date().toISOString() };
    await c.env.CACHE.put(`dsr:public:${id}`, JSON.stringify(payload), { expirationTtl: 60 * 60 * 24 * 30 });
    return c.json({ success: true, requestId: id });
  } catch (err) {
    return c.json({ success: false, error: { code: 'DSR_ERROR', message: 'Failed to submit request' } }, 500);
  }
});

// Check export status
privacy.get('/export/status/:exportId', async (c) => {
  try {
    const exportId = c.req.param('exportId');
    const raw = await c.env.CACHE.get(`gdpr:export:${exportId}`);
    if (!raw) return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Export not found' } }, 404);
    return c.json({ success: true, export: JSON.parse(raw) });
  } catch (err) {
    return c.json({ success: false, error: { code: 'STATUS_ERROR', message: 'Failed to retrieve status' } }, 500);
  }
});

export default privacy;

