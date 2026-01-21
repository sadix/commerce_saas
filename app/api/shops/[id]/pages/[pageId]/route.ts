// src/app/api/shops/[id]/pages/[pageId]/route.ts

import { NextResponse,NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
    pageId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const { id, pageId } = await params;
  const page = await prisma.page.findUnique({
    where: { id: pageId },
  });

  if (!page || page.shopId !== id) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PATCH(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);

  const { id, pageId } = await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { shop: true },
  });

  if (!page || page.shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // If slug is being changed, check uniqueness
  if (body.slug && body.slug !== page.slug) {
    const existing = await prisma.page.findFirst({
      where: {
        shopId: id,
        slug: body.slug,
        NOT: { id: pageId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 400 });
    }
  }

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);
  const { id, pageId } = await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { shop: true },
  });

  if (!page || page.shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Prevent deletion of home page
  if (page.isHome) {
    return NextResponse.json(
      { error: 'Cannot delete the home page. Set another page as home first.' },
      { status: 400 }
    );
  }

  await prisma.page.delete({
    where: { id: pageId },
  });

  return NextResponse.json({ success: true });
}