export type PlanTier = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
export type Theme = 'basic' | 'premium';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  /** Stripe Price ID for this plan's recurring price. null = not purchasable (e.g. Free). */
  stripePriceId: string | null;
  /**
   * Amount to charge via SenePay, in XOF (whole francs — no decimal
   * subdivision). SenePay checkout takes a raw amount rather than a price
   * ID, so this is what we send directly on each renewal. Placeholder
   * values below — replace with your real XOF pricing.
   */
  priceXOF: number | null;
  priceLabel: string;
  maxShops: number; // use Infinity for "unlimited"
  maxProductsPerShop: number; // use Infinity for "unlimited"
  themes: Theme[];
  features: string[];
}

// Fill in your real Stripe Price IDs via env vars (see BILLING_SETUP.md).
export const PLANS: Record<PlanTier, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    stripePriceId: null,
    priceXOF: null,
    priceLabel: 'FCFA 0/Mois',
    maxShops: 1,
    maxProductsPerShop: 10,
    themes: ['basic'],
    features: ['1 shop', 'Up to 10 products', 'Basic themes'],
  },
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "price_1TqwO5GlVw9ROCZg4E0qsr6D",
    priceXOF: 7500,
    priceLabel: 'FCFA 7500/Mois',
    maxShops: 1,
    maxProductsPerShop: 100,
    themes: ['basic'],
    features: ['1 shop', 'Up to 100 products', 'Basic themes'],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "price_1Tqx5IGlVw9ROCZgbO6AbgLq",
    priceXOF: 12000,
    priceLabel: 'FCFA 12000/Mois',
    maxShops: 3,
    maxProductsPerShop: Infinity,
    themes: ['basic', 'premium'],
    features: ['Up to 3 shops', 'Unlimited products', 'Basic + Premium themes'],
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business',
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS ?? "price_1Tqx5qGlVw9ROCZgQrrKM5R0",
    priceXOF: 19900,
    priceLabel: 'FCFA 19900/Mois',
    maxShops: Infinity,
    maxProductsPerShop: Infinity,
    themes: ['basic', 'premium'],
    features: [
      'Unlimited shops',
      'Unlimited products',
      'Basic + Premium themes',
      'Priority support',
    ],
  },
};

export const PLAN_ORDER: PlanTier[] = ['FREE', 'STARTER', 'PRO', 'BUSINESS'];

/** Reverse-lookup: given a Stripe Price ID, which plan is it? Falls back to FREE. */
export function getPlanByPriceId(priceId: string | null | undefined): PlanTier {
  if (!priceId) return 'FREE';
  const match = Object.values(PLANS).find((p) => p.stripePriceId === priceId);
  return match?.id ?? 'FREE';
}

export function isPaidPlan(plan: PlanTier): boolean {
  return plan !== 'FREE';
}
