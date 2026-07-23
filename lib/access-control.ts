import { prisma } from '@/lib/prisma';
import { getAccessStatus } from '@/lib/subscription';
import { Theme } from '@/lib/plans';

export interface GateResult {
  allowed: boolean;
  reason?: string;
}

/** Call before creating a new shop for a user. */
export async function canCreateShop(userId: string): Promise<GateResult> {
  const access = await getAccessStatus(userId);
  if (access.locked) return { allowed: false, reason: access.reason };

  const plan = access.plan;
  const shopCount = await prisma.shop.count({ where: { userId: userId } });

  if (shopCount >= plan.maxShops) {
    return {
      allowed: false,
      reason: `Your ${plan.name} plan allows ${describeLimit(plan.maxShops, 'shop')}. Upgrade to add more.`,
    };
  }
  return { allowed: true };
}

/** Call before creating a new product on a shop. */
export async function canCreateProduct(shopId: string): Promise<GateResult> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { userId: true },
  });
  if (!shop) return { allowed: false, reason: 'Shop not found.' };

  const access = await getAccessStatus(shop.userId);
  if (access.locked) return { allowed: false, reason: access.reason };

  const plan = access.plan;
  const productCount = await prisma.product.count({ where: { shopId } });

  if (productCount >= plan.maxProductsPerShop) {
    return {
      allowed: false,
      reason: `Your ${plan.name} plan allows ${describeLimit(plan.maxProductsPerShop, 'product')} per shop. Upgrade for more.`,
    };
  }
  return { allowed: true };
}

/** Call before letting a user apply a theme to their shop. */
export async function canUseTheme(userId: string, theme: Theme): Promise<GateResult> {
  const access = await getAccessStatus(userId);
  if (access.locked) return { allowed: false, reason: access.reason };

  if (!access.plan.themes.includes(theme)) {
    return {
      allowed: false,
      reason: `The ${theme} theme isn't available on your ${access.plan.name} plan. Upgrade to unlock it.`,
    };
  }
  return { allowed: true };
}

/**
 * Broader than the gates above: use this to protect *any* authenticated
 * page or API route, not just create actions — e.g. in a dashboard layout
 * (redirect) or at the top of every shop/product route handler (402).
 * Note: this calls Prisma, so it must run in the Node.js runtime, not Edge
 * middleware (Prisma doesn't work in Edge middleware without a driver
 * adapter). Put this in server components / route handlers instead.
 */
export async function requireActiveAccess(userId: string): Promise<GateResult> {
  const access = await getAccessStatus(userId);
  if (access.locked) return { allowed: false, reason: access.reason };
  return { allowed: true };
}

function describeLimit(limit: number, noun: string): string {
  if (limit === Infinity) return `unlimited ${noun}s`;
  return `up to ${limit} ${noun}${limit === 1 ? '' : 's'}`;
}

/**
 * Convenience wrapper for API routes: runs a gate check and, if it fails,
 * returns a ready-to-send 402 response. Usage in a route handler:
 *
 *   const gate = await canCreateProduct(shopId);
 *   const blocked = gateResponse(gate);
 *   if (blocked) return blocked;
 */
export function gateResponse(gate: GateResult) {
  if (gate.allowed) return null;
  return new Response(JSON.stringify({ error: gate.reason }), {
    status: 402, // Payment Required
    headers: { 'Content-Type': 'application/json' },
  });
}
