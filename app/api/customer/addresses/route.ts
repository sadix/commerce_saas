// src/app/api/customer/addresses/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
  }

  const addresses = await prisma.address.findMany({
    where: { customerId },
    orderBy: { isDefault: 'desc' },
  });

  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { customerId, ...addressData } = body;

  if (!customerId) {
    return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
  }

  // If setting as default, unset other defaults
  if (addressData.isDefault) {
    await prisma.address.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      customerId,
      ...addressData,
    },
  });

  return NextResponse.json(address, { status: 201 });
}