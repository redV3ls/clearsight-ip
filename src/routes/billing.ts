import { Hono } from 'hono';
import { Env } from '../index';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { getPlans, getUserCredits, addUserCredits } from '../services/billing';

const billing = new Hono<{ Bindings: Env }>();

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

export default billing;

