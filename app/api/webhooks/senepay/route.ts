import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySenePaySignature, SenePayWebhookPayload } from '@/lib/senepay';
import { PlanTier } from '@/lib/plans';
import { logActivity } from '@/lib/activity-logger';

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-senepay-signature');

  if (!verifySenePaySignature(rawBody, signature)) {
    console.error('SenePay webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as SenePayWebhookPayload;
  const userId = payload.metadata?.userId;
  const plan = payload.metadata?.plan as PlanTier | undefined;

  if (!userId || !plan) {
    console.error(`SenePay webhook for session ${payload.sessionToken} is missing userId/plan metadata`);
    // Still 200 — this isn't a signature/retry problem, retrying won't help.
    return NextResponse.json({ received: true });
  }

  try {
    if (payload.event === 'checkout.session.completed') {
      // Each successful checkout buys exactly one more month from now,
      // regardless of whether this is a first purchase or a renewal — we
      // don't try to stack unused time from a prior period.
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan,
          status: 'ACTIVE',
          provider: 'SENEPAY',
          senepayLastSessionToken: payload.sessionToken,
          senepayPhone: payload.customer_phone,
          currentPeriodEnd: new Date(Date.now() + ONE_MONTH_MS),
          stripeCustomerId: `senepay_${payload.metadata?.userId}`, // dummy value to satisfy schema
        },
        update: {
          plan,
          status: 'ACTIVE',
          provider: 'SENEPAY',
          senepayLastSessionToken: payload.sessionToken,
          senepayPhone: payload.customer_phone,
          currentPeriodEnd: new Date(Date.now() + ONE_MONTH_MS),
          renewalReminderSentAt: null,
        },
      });
    }

    if (payload.event === 'checkout.session.failed') {
      // Don't touch `status` here — a failed renewal attempt shouldn't
      // immediately lock someone out. The cron job in
      // /api/cron/senepay-renewals is what moves PAST_DUE -> EXPIRED once
      // the grace period actually runs out.
      logActivity('SenePay Payment Failed', 'system', { userId, sessionToken: payload.sessionToken }, req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || "unknown ip address");
    }
  } catch (err) {
    console.error('Error processing SenePay webhook:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  logActivity('SenePay Webhook Received', 'system', { userId, eventType: payload.event, sessionToken: payload.sessionToken }, req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || "unknown ip address");

  return NextResponse.json({ received: true });
}
