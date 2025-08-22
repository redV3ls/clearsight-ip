import { Hono } from 'hono';
import { Env } from '../index';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { getPlans, getUserCredits, addUserCredits } from '../services/billing';
import { requireAuth } from '../middleware/auth';

const billing = new Hono<{ Bindings: Env }>();

// Apply auth to all billing routes except plans listing
billing.use('/credits', requireAuth);
billing.use('/purchase', requireAuth);
billing.use('/checkout', requireAuth);
billing.use('/confirm', requireAuth);

// GET /billing/plans - list available plans
billing.get('/plans', async (c) => {
  const plans = getPlans();
  return c.json({ success: true, plans });
});

// GET /billing/credits - get current user's remaining analysis credits
billing.get('/credits', async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }
  const credits = await getUserCredits(c.env.CACHE, user.id);
  return c.json({ success: true, credits });
});

// POST /billing/purchase - simulate a plan purchase and add credits
billing.post('/purchase', async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const schema = z.object({ planId: z.string() });
  let body: { planId: string };
  try {
    body = schema.parse(await c.req.json());
  } catch {
    throw new AppError('Invalid request body', 400, 'INVALID_REQUEST');
  }

  const plans = getPlans();
  const plan = plans.find(p => p.id === body.planId);
  if (!plan) {
    throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
  }

  // In a real integration, validate payment via Stripe/etc. before adding credits
  const newCredits = await addUserCredits(c.env.CACHE, user.id, plan.credits);

  return c.json({
    success: true,
    plan: { id: plan.id, name: plan.name, priceUsd: plan.priceUsd, credits: plan.credits },
    credits: newCredits,
    message: `Purchased ${plan.name}. ${plan.credits} analysis credits added.`
  });
});

// POST /billing/checkout - create Stripe Checkout session and return redirect URL
billing.post('/checkout', async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }
  if (!c.env.STRIPE_SECRET_KEY) {
    throw new AppError('Stripe is not configured', 500, 'STRIPE_NOT_CONFIGURED');
  }

  const schema = z.object({ planId: z.enum(['pack-4', 'pack-10', 'pack-30']) });
  let body: { planId: 'pack-4' | 'pack-10' | 'pack-30' };
  try {
    body = schema.parse(await c.req.json());
  } catch {
    throw new AppError('Invalid request body', 400, 'INVALID_REQUEST');
  }

  const priceMap: Record<string, string | undefined> = {
    'pack-4': c.env.STRIPE_PRICE_ID_PACK_4,
    'pack-10': c.env.STRIPE_PRICE_ID_PACK_10,
    'pack-30': c.env.STRIPE_PRICE_ID_PACK_30,
  };
  const priceId = priceMap[body.planId];
  if (!priceId) {
    throw new AppError('Stripe price ID missing for selected plan', 500, 'STRIPE_PRICE_MISSING');
  }

  const reqUrl = new URL(c.req.url);
  const origin = reqUrl.origin;
  const successUrl = `${origin}/?purchase=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/?purchase=cancelled`;

  const form = new URLSearchParams();
  form.append('mode', 'payment');
  form.append('success_url', successUrl);
  form.append('cancel_url', cancelUrl);
  form.append('line_items[0][price]', priceId);
  form.append('line_items[0][quantity]', '1');
  form.append('customer_email', user.email || '');
  // Attach metadata for later confirmation
  form.append('metadata[planId]', body.planId);
  form.append('metadata[userId]', user.id);
  form.append('client_reference_id', user.id);

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form
  });

  const payload = await stripeRes.json<any>();
  if (!stripeRes.ok) {
    const message = payload?.error?.message || 'Failed to create Stripe Checkout session';
    throw new AppError(message, 502, 'STRIPE_CHECKOUT_ERROR');
  }

  return c.json({ success: true, url: payload.url });
});

// POST /billing/confirm - confirm a Stripe checkout session and add credits
billing.post('/confirm', async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }
  if (!c.env.STRIPE_SECRET_KEY) {
    throw new AppError('Stripe is not configured', 500, 'STRIPE_NOT_CONFIGURED');
  }

  const schema = z.object({ sessionId: z.string() });
  let body: { sessionId: string };
  try {
    body = schema.parse(await c.req.json());
  } catch {
    throw new AppError('Invalid request body', 400, 'INVALID_REQUEST');
  }

  // Idempotency: prevent granting twice for the same session
  const processedKey = `stripe:processed:${body.sessionId}`;
  const alreadyProcessed = await c.env.CACHE.get(processedKey);
  if (alreadyProcessed) {
    const credits = await getUserCredits(c.env.CACHE, user.id);
    return c.json({ success: true, alreadyProcessed: true, credits });
  }

  // Retrieve the session from Stripe
  const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(body.sessionId)}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}` }
  });
  const session = await stripeRes.json<any>();
  if (!stripeRes.ok) {
    const message = session?.error?.message || 'Failed to retrieve Stripe session';
    throw new AppError(message, 502, 'STRIPE_SESSION_ERROR');
  }

  // Validate session belongs to current user
  if (session.client_reference_id && session.client_reference_id !== user.id) {
    throw new AppError('Session does not belong to the current user', 403, 'FORBIDDEN');
  }

  // Check payment status
  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    throw new AppError('Payment not completed yet', 409, 'PAYMENT_PENDING');
  }

  const planId = session.metadata?.planId as 'pack-4' | 'pack-10' | 'pack-30' | undefined;
  if (!planId) {
    throw new AppError('Missing planId in session metadata', 500, 'MISSING_PLAN_METADATA');
  }

  const plan = getPlans().find(p => p.id === planId);
  if (!plan) {
    throw new AppError('Unknown plan in session', 500, 'UNKNOWN_PLAN');
  }

  const newCredits = await addUserCredits(c.env.CACHE, user.id, plan.credits);
  // Mark processed for idempotency (keep for 30 days)
  await c.env.CACHE.put(processedKey, '1', { expirationTtl: 60 * 60 * 24 * 30 });

  return c.json({ success: true, credits: newCredits, plan: { id: plan.id, name: plan.name, credits: plan.credits } });
});

export default billing;

