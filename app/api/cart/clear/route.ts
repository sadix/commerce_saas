// src/app/api/cart/clear/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { shopId, sessionId } = body;

  const cart = await prisma.cart.findUnique({
    where: {
      shopId_sessionId: {
        shopId,
        sessionId,
      },
    },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
  }

  return NextResponse.json({ items: [] });
}