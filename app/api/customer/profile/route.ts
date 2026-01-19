// src/app/api/customer/profile/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { customerId, name, phone } = body;

  if (!customerId) {
    return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: { name, phone },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
    },
  });

  return NextResponse.json(customer);
}