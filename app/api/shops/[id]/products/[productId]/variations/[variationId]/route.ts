// src/app/api/shops/[id]/products/[productId]/variations/[variationId]/route.ts
import { NextResponse,NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
    productId: string;
    variationId: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);

  const {id, productId, variationId} = await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.productVariation.delete({
    where: { id: variationId },
  });

  // Check if there are any remaining variations
  const remainingCount = await prisma.productVariation.count({
    where: { productId: productId },
  });

  if (remainingCount === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { hasVariations: false },
    });
  }

  return NextResponse.json({ success: true });
}