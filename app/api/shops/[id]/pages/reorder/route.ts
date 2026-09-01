// src/app/api/shops/[shopId]/pages/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // NOTE: adjust to your actual authOptions import path
import { prisma } from '@/lib/prisma';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
  }>;
}

export async function PATCH(
  req: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const shop = await prisma.shop.findUnique({
    where: { id: id },
    select: { userId: true }, // NOTE: confirm this matches shop.ownerId in your schema
  });

  if (!shop || shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const pages = body?.pages as { id: string; weight: number }[] | undefined;

  if (!Array.isArray(pages) || pages.length === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Guard against a shop owner reordering pages that don't belong to them
  const pageIds = pages.map((p) => p.id);
  const owned = await prisma.page.findMany({
    where: { id: { in: pageIds }, shopId: id },
    select: { id: true },
  });

  if (owned.length !== pageIds.length) {
    return NextResponse.json(
      { error: 'One or more pages do not belong to this shop' },
      { status: 400 }
    );
  }

  await prisma.$transaction(
    async (tx) =>{
        pages.map((p) =>
        prisma.page.update({
            where: { id: p.id },
            data: { weight: p.weight },
        })
        )
    },
    {
        maxWait: 5000, // default is 2000
        timeout: 10000, // default is 5000
    }
    
  );

  const updated = await prisma.page.findMany({
    where: { shopId: id },
    orderBy: { weight: 'asc' },
  });

  return NextResponse.json(updated);
}