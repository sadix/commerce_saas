// src/app/api/shops/[id]/categories/[categoryId]/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
    categoryId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const { id, categoryId } = await params;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      products: true,
    },
  });

  if (!category || category.shopId !== id) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PATCH(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const { id, categoryId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { shop: true },
  });

  if (!category || category.shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // If slug is being changed, check uniqueness
  if (body.slug && body.slug !== category.slug) {
    const existing = await prisma.category.findFirst({
      where: {
        shopId: id,
        slug: body.slug,
        NOT: { id: categoryId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
    }
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions);
  const { id, categoryId } = await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { 
      shop: true,
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category || category.shop.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Prevent deletion if category has products
  if (category._count.products > 0) {
    return NextResponse.json(
      { error: 'Cannot delete category with products. Remove products first.' },
      { status: 400 }
    );
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return NextResponse.json({ success: true });
}