// src/app/api/shops/[id]/products/route.ts

import { NextResponse,NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canCreateProduct, gateResponse } from '@/lib/access-control';

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
  const products = await prisma.product.findMany({
    where: { shopId: id },
    orderBy: { created_at: 'desc' },
    include: {
      attributes:{
        include:{attribute:true}
      },
      platform_category: true,
    }
  });

  return NextResponse.json(products);
}

export async function POST(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);

  const { id } =  await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gate = await canCreateProduct(id);
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const body = await request.json();

  const shop = await prisma.shop.findUnique({
    where: { id: id },
  });

  if (!shop || shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  

  

  
  

  const product = await prisma.product.create({
    data: {
      ...body,
      shopId: id,
      attributes: {
        create: body.attributes
      }
    },
  });

  return NextResponse.json(product, { status: 201 });
}