import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: ReqParamProps
) {
  const { id } = await params;
  const shop = await prisma.shop.findUnique({
    where: { id: id },
    include: {
      theme: true,
      pages: true,
    },
  });

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  return NextResponse.json(shop);
}

export async function PATCH(
  request: Request,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);

  const { id } =  await params;
  
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

  const updated = await prisma.shop.update({
    where: { id: id },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shop = await prisma.shop.findUnique({
    where: { id: id },
  });

  if (!shop || shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.shop.delete({
    where: { id: id },
  });

  return NextResponse.json({ success: true });
}