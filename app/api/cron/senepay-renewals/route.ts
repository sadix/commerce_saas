import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSenePayCheckoutSession } from '@/lib/senepay';
import { PLANS } from '@/lib/plans';
import { SENEPAY_RENEWAL_REMINDER_DAYS, SENEPAY_GRACE_PERIOD_DAYS } from '@/lib/trial';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Runs once a day (wire up via Vercel Cron / GitHub Actions / any scheduler
 * that can hit a URL with a bearer token — see BILLING_SETUP.md).
 *
 * 1. SenePay subs approaching currentPeriodEnd -> email/SMS a fresh
 *    checkout link, once per period.
 * 2. SenePay subs past currentPeriodEnd -> PAST_DUE (grace period starts).
 * 3. SenePay subs past their grace period -> EXPIRED (fully locked — same
 *    status the Free trial uses, so access-control.ts locks both cases
 *    identically).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + SENEPAY_RENEWAL_REMINDER_DAYS * DAY_MS);

  const results = { remindersSent: 0, markedPastDue: 0, markedExpired: 0, errors: [] as string[] };

  // ── 1. Send renewal reminders ──────────────────────────────────────────
  const upcomingRenewals = await prisma.subscription.findMany({
    where: {
      provider: 'SENEPAY',
      status: 'ACTIVE',
      plan: { not: 'FREE' },
      currentPeriodEnd: { lte: reminderThreshold, gt: now },
      renewalReminderSentAt: null,
    },
    include: { user: true },
  });

  for (const sub of upcomingRenewals) {
    try {
      const planConfig = PLANS[sub.plan];
      if (!planConfig.priceXOF) continue;

      const session = await createSenePayCheckoutSession({
        amount: planConfig.priceXOF,
        orderReference: `sub_${sub.userId}_${sub.plan}_${Date.now()}`,
        description: `${planConfig.name} plan — renewal`,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/senepay`,
        metadata: { userId: sub.userId, plan: sub.plan },
      });

      // TODO: wire up your actual email/SMS sender here.
      // await sendRenewalReminder(sub.user.email, sub.senepayPhone, session.checkoutUrl);
      console.log(`Renewal reminder for user ${sub.userId}: ${session.checkoutUrl}`);

      await prisma.subscription.update({
        where: { userId: sub.userId },
        data: { renewalReminderSentAt: now },
      });
      results.remindersSent++;
    } catch (err) {
      results.errors.push(`reminder for ${sub.userId}: ${(err as Error).message}`);
    }
  }

  // ── 2. Mark lapsed renewals PAST_DUE ───────────────────────────────────
  const justLapsed = await prisma.subscription.updateMany({
    where: {
      provider: 'SENEPAY',
      status: 'ACTIVE',
      currentPeriodEnd: { lt: now },
    },
    data: { status: 'PAST_DUE' },
  });
  results.markedPastDue = justLapsed.count;

  // ── 3. Fully expire anything past its grace period ─────────────────────
  const graceExpiredBefore = new Date(now.getTime() - SENEPAY_GRACE_PERIOD_DAYS * DAY_MS);
  const graceExpired = await prisma.subscription.updateMany({
    where: {
      provider: 'SENEPAY',
      status: 'PAST_DUE',
      currentPeriodEnd: { lt: graceExpiredBefore },
    },
    data: { status: 'INCOMPLETE_EXPIRED' },
  });
  results.markedExpired = graceExpired.count;

  return NextResponse.json(results);
}
