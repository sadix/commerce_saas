// src/app/api/cart/add/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { shopId, sessionId, productId, quantity = 1 } = body;

  if (!shopId || !sessionId || !productId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Check if product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variations: true },
  });

  if (!product || product.stock < quantity) {
    return NextResponse.json({ error: 'Product not available' }, { status: 400 });
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: {
      shopId_sessionId: {
        shopId,
        sessionId,
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        shopId,
        sessionId,
      },
    });
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_variationId: {
        cartId: cart.id,
        productId,
        variationId: product.variations.length > 0 ? product.variations[0].id : "null",
       
      },
    },
  });

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

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
