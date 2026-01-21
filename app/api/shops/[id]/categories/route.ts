// src/app/api/shops/[id]/categories/route.ts

import { NextResponse } from 'next/server';
import {NextRequest} from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
  const categories = await prisma.category.findMany({
    where: { shopId: id },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(categories);
}

export async function POST(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
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
  const existing = await prisma.category.findFirst({
    where: {
      shopId: id,
      slug: body.slug,
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      ...body,
      shopId: id,
    },
  });

  return NextResponse.json(category, { status: 201 });
}