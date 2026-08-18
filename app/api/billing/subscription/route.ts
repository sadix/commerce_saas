import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';
import { getAccessStatus } from '@/lib/subscription';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';


export async function GET(req: NextRequest) {
  const auth_session = await getServerSession(authOptions);
  const user = auth_session?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  //const plan = PLANS[subscription?.plan ?? 'FREE'];
  const access = await getAccessStatus(user.id);

 return NextResponse.json({
    plan: access.plan.id,
    planName: access.plan.name,
    status: subscription?.status ?? 'TRIALING',
    provider: subscription?.provider ?? null,
    locked: access.locked,
    lockedReason: access.reason ?? null,
    trialEndsAt: subscription?.trialEndsAt ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    limits: {
      maxShops: Number.isFinite(access.plan.maxShops) ? access.plan.maxShops : null,
      maxProductsPerShop: Number.isFinite(access.plan.maxProductsPerShop) ? access.plan.maxProductsPerShop : null,
      themes: access.plan.themes,
    },
  });
}
