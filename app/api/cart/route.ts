// src/app/api/cart/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopId = await searchParams.get('shopId');
  const sessionId = await searchParams.get('sessionId');

  if (!shopId || !sessionId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: {
      shopId_sessionId: {
        shopId,
        sessionId,
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const items = cart?.items.map(item => ({
    id: item.id,
    productId: item.product.id,
    productName: item.product.name,
    productImage: item.product.images[0] || null,
    price: item.product.price,
    quantity: item.quantity,
  })) || [];

  return NextResponse.json({ items });
}