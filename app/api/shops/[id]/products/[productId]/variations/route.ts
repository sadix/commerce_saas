// API Route: src/app/api/shops/[id]/products/[productId]/variations/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string; productId: string } }
) {
  const {productId} = await params;
  const variations = await prisma.productVariation.findMany({
    where: { productId: productId },
  });

  return NextResponse.json(variations);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; productId: string } }
) {
  const session = await getServerSession(authOptions);
  const {productId} = await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const variation = await prisma.productVariation.create({
    data: {
      productId: productId,
      ...body,
    },
  });

  // Update product to indicate it has variations
  await prisma.product.update({
    where: { id: productId },
    data: { hasVariations: true },
  });

  return NextResponse.json(variation, { status: 201 });
}