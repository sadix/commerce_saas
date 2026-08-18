import { NextResponse,NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const { id } = await params;
  const pages = await prisma.page.findMany({
    where: { shopId: id },
    orderBy: { created_at: 'asc' },
  });

  return NextResponse.json(pages);
}

export async function POST(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);

  const {id} = await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const shop = await prisma.shop.findUnique({
    where: { id: id },
  });

  if (!shop || shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if slug is unique for this shop
  const existing = await prisma.page.findFirst({
    where: {
      shopId: id,
      slug: body.slug,
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 400 });
  }

  // If this is set as home page, unset other home pages
  if (body.isHome) {
    await prisma.page.updateMany({
      where: {
        shopId: id,
        isHome: true,
      },
      data: {
        isHome: false,
      },
    });
  }

  const page = await prisma.page.create({
    data: {
      ...body,
      shopId: id,
    },
  });

  await logActivity('Page Created', session.user.id, { pageId: page.id, shopId: id }, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "unknown ip address");
  return NextResponse.json(page, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);

  const {id} = await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { pageId, ...data } = body;

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { shop: true },
  });

  if (!page || page.shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.page.update({
    where: { id: pageId },
    data,
  });

  await logActivity('Page Updated', session.user.id, { pageId: pageId, shopId: id }, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "unknown ip address");
  return NextResponse.json(updated);
}