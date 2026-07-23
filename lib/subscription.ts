import { prisma } from '@/lib/prisma';
import { PLANS, PlanConfig, PlanTier } from '@/lib/plans';
import { computeTrialEnd } from '@/lib/trial';

export { computeTrialEnd };

/** Statuses that mean "the plan on this row is actually usable right now." */
const USABLE_STATUSES = new Set(['ACTIVE', 'TRIALING']);

/** Statuses that mean "fully locked, must subscribe to continue." */
const LOCKED_STATUSES = new Set(['EXPIRED', 'CANCELED', 'UNPAID', 'INCOMPLETE_EXPIRED']);

/**
 * True if this row's Free trial window has passed (regardless of what
 * `status` currently says in the DB — this is checked in real time so we
 * don't depend on a cron job having already run).
 */
function isTrialLapsed(subscription: { plan: PlanTier; status: string; trialEndsAt: Date | null }): boolean {
  if (subscription.plan !== 'FREE') return false;
  if (subscription.status !== 'TRIALING') return false;
  if (!subscription.trialEndsAt) return false;
  return subscription.trialEndsAt.getTime() < Date.now();
}

export interface AccessStatus {
  /** true = fully restrict the account until they subscribe. */
  locked: boolean;
  reason?: string;
  plan: PlanConfig;
}

/**
 * The single check to run before letting a user do *anything* in the app.
 * Combines: no subscription row yet, active paid/trial subscription, an
 * expired trial, a canceled paid plan, or a missed SenePay renewal past its
 * grace period.
 */
export async function getAccessStatus(userId: string): Promise<AccessStatus> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  // No row at all shouldn't normally happen (see prisma.ts's user.create
  // extension), but fail open to a fresh Free trial rather than locking
  // someone out due to a missed hook.
  if (!subscription) {
    return { locked: false, plan: PLANS.FREE };
  }

  if (LOCKED_STATUSES.has(subscription.status) || isTrialLapsed(subscription)) {
    const reason =
      subscription.plan === 'FREE'
        ? 'Your 1-month free trial has ended. Choose a plan to keep using the app.'
        : 'Your subscription has ended. Renew to keep using the app.';
    return { locked: true, reason, plan: PLANS.FREE };
  }

  const plan = USABLE_STATUSES.has(subscription.status) ? PLANS[subscription.plan] : PLANS.FREE;
  return { locked: false, plan };
}

/** Returns the DB subscription row, or null if none / not currently usable. */
export async function getActiveSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) return null;
  if (!USABLE_STATUSES.has(subscription.status) || isTrialLapsed(subscription)) return null;
  return subscription;
}

/** Returns the plan config a user should be limited to right now. */
export async function getUserPlan(userId: string): Promise<PlanConfig> {
  const access = await getAccessStatus(userId);
  return access.plan;
}
