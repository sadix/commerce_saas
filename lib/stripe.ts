import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// No apiVersion pinned here on purpose — it defaults to the version tied to
// your Stripe account / installed SDK. Pin one explicitly once you've
// checked which version your `stripe` package expects (Dashboard > Developers
// > API keys shows your account's default).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
