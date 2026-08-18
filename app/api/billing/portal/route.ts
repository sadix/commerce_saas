import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import {getServerSession} from 'next-auth';
import { logActivity } from '@/lib/activity-logger';
//import { getCurrentUser } from '@/lib/auth'; // TODO: point this at your existing auth helper

export async function POST(req: NextRequest) {
  const auth_session = await getServerSession(authOptions);
  const user = auth_session?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found for this user' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  logActivity('Stripe Billing Portal Session Created', 'system', { sessionId: portalSession.id }, req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || "unknown ip address");
  return NextResponse.json({ url: portalSession.url });
}
