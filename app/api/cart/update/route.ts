// src/app/api/cart/update/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { shopId, sessionId, productId, quantity } = body;

  const cart = await prisma.cart.findUnique({
    where: {
      shopId_sessionId: {
        shopId,
        sessionId,
      },
    },
  });

  if (!cart) {
    return NextResponse.json({ items: [] });
  }

  await prisma.cartItem.updateMany({
    where: {
      cartId: cart.id,
      productId,
    },
    data: {
      quantity,
    },
  });

  // Return updated cart
  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const items = updatedCart?.items.map(item => ({
    id: item.id,
    productId: item.product.id,
    productName: item.product.name,
    productImage: item.product.images[0] || null,
    price: item.product.price,
    quantity: item.quantity,
  })) || [];

  return NextResponse.json({ items });
}