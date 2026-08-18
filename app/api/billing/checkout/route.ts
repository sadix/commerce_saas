import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSenePayCheckoutSession } from '@/lib/senepay';
import { prisma } from '@/lib/prisma';
import { PLANS, PlanTier } from '@/lib/plans';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { logActivity } from '@/lib/activity-logger';

type Provider = 'stripe' | 'senepay';

export async function POST(req: NextRequest) {
  const auth_session = await getServerSession(authOptions);
  const user = auth_session?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan , provider } = (await req.json()) as { plan: PlanTier, provider: Provider };
  const planConfig = PLANS[plan];

  if (!planConfig || !planConfig.stripePriceId) {
    return NextResponse.json({ error: 'Invalid or unpurchasable plan' }, { status: 400 });
  }


  if (provider === 'senepay') {
    if (!planConfig.priceXOF) {
      return NextResponse.json({ error: 'This plan is not purchasable via SenePay' }, { status: 400 });
    }

    // No customer/subscription object on SenePay's side — each period is
    // its own checkout session. orderReference doubles as our idempotency
    // key; metadata carries the userId/plan back to us on the webhook.
    const orderReference = `sub_${user.id}_${plan}_${Date.now()}`;

    const session = await createSenePayCheckoutSession({
      amount: planConfig.priceXOF,
      orderReference,
      description: `${planConfig.name} plan — 1 month`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/senepay`,
      metadata: { userId: user.id, plan },
    });

    //console.log('webhook url:', `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/senepay`);

    //console.log('SenePay checkout session created:', session);

    return NextResponse.json({ url: session.checkoutUrl });
  }

  // ── Stripe (default) ──────────────────────────────────────────────────
  if (!planConfig.stripePriceId) {
    return NextResponse.json({ error: 'Invalid or unpurchasable plan' }, { status: 400 });
  }

  // Reuse an existing Stripe customer if this user already has one,
  // otherwise create it now and store it right away so we never lose track
  // of it even if the checkout is abandoned.
  let customerId: string | undefined;
  const existing = await prisma.subscription.findUnique({ where: { userId: user.id } });
  customerId = existing?.stripeCustomerId;
  customerId = customerId == user.id ? undefined : customerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email? user.email : undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, stripeCustomerId: customerId, plan: 'FREE' },
      update: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    // Metadata on the subscription itself (not just the session) so every
    // webhook event about this subscription carries the userId with it.
    subscription_data: {
      metadata: { userId: user.id, plan },
    },
    metadata: { userId: user.id, plan },
  });

   logActivity('Stripe Checkout Session Created', 'system', { sessionId: session.id }, req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || "unknown ip address");

  return NextResponse.json({ url: session.url });
}
