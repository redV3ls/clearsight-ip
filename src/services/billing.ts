import { AppError } from '../middleware/errorHandler';

export type Plan = {
  id: 'pack-4' | 'pack-10' | 'pack-30';
  name: string;
  priceUsd: number;
  credits: number; // number of analyses included
};

const PLANS: Plan[] = [
  { id: 'pack-4', name: 'Starter Pack', priceUsd: 5, credits: 4 },
  { id: 'pack-10', name: 'Pro Pack', priceUsd: 10, credits: 10 },
  { id: 'pack-30', name: 'Power Pack', priceUsd: 20, credits: 30 },
];

export function getPlans(): Plan[] {
  return PLANS;
}

const keyFor = (userId: string) => `user:credits:${userId}`;

export async function getUserCredits(kv: KVNamespace, userId: string): Promise<number> {
  const raw = await kv.get(keyFor(userId));
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export async function setUserCredits(kv: KVNamespace, userId: string, credits: number): Promise<number> {
  const value = Math.max(0, Math.floor(credits));
  await kv.put(keyFor(userId), String(value));
  return value;
}

export async function addUserCredits(kv: KVNamespace, userId: string, delta: number): Promise<number> {
  const current = await getUserCredits(kv, userId);
  return setUserCredits(kv, userId, current + delta);
}

export async function consumeCreditOrThrow(kv: KVNamespace, userId: string): Promise<number> {
  const current = await getUserCredits(kv, userId);
  if (current <= 0) {
    throw new AppError('No analysis credits remaining. Please purchase a plan to continue.', 402, 'PAYMENT_REQUIRED');
  }
  return setUserCredits(kv, userId, current - 1);
}

export async function refundCredit(kv: KVNamespace, userId: string): Promise<number> {
  // Used when an analysis fails before producing a result
  return addUserCredits(kv, userId, 1);
}

