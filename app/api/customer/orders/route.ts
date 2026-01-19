// src/app/api/customer/orders/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      address: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}