import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getPlanByPriceId } from '@/lib/plans';
import {headers} from 'next/headers';

// Required so Next.js doesn't parse the body — Stripe's signature check
// needs the exact raw bytes.
export const runtime = 'nodejs';

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case 'active':
      return 'ACTIVE';
    case 'trialing':
      return 'TRIALING';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELED';
    case 'incomplete':
      return 'INCOMPLETE';
    case 'incomplete_expired':
      return 'INCOMPLETE_EXPIRED';
    case 'unpaid':
      return 'UNPAID';
    default:
      return 'INCOMPLETE';
  }
}

async function upsertFromStripeSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) {
    console.error(`Stripe subscription ${sub.id} has no userId metadata — skipping sync`);
    return;
  }

  const priceId = sub.items.data[0]?.price?.id ?? null;
  const plan = getPlanByPriceId(priceId);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      plan,
      status: mapStripeStatus(sub.status),
      currentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      plan,
      status: mapStripeStatus(sub.status),
      currentPeriodEnd: new Date(sub.items.data[0].current_period_end* 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  //const signature = req.headers.get('stripe-signature');
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  console.log("body signature ans secret", body, signature, process.env.STRIPE_WEBHOOK_SECRET);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Fires once at the end of a successful checkout. We fetch the full
      // subscription object rather than trusting the session payload, since
      // it's the more complete/authoritative source.
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertFromStripeSubscription(sub);
        }
        break;
      }

      // Fires on renewals, plan changes (upgrade/downgrade via the portal),
      // cancellation scheduling, and payment failures reflected on the sub.
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await upsertFromStripeSubscription(sub);
        break;
      }

      // Optional: notify the user their card failed. The subscription's
      // status will also move to `past_due`/`unpaid` via subscription.updated,
      // which is what actually drives access — this is just for messaging.
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`Invoice payment failed for customer ${invoice.customer}`);
        // TODO: send a "your payment failed" email/notification here.
        break;
      }

      default:
        break; // Unhandled event types are fine to ignore.
    }
  } catch (err) {
    console.error(`Error handling Stripe webhook event ${event.type}:`, err);
    // Return 500 so Stripe retries the event.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
