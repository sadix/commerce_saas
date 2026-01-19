// src/app/api/customer/login/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { base64 } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopId, email, password } = body;

    if (!shopId || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find customer
    /* const customer = await prisma.customer.findUnique({
      where: {
        shopId_email: {
          shopId,
          email,
        },
      },
    }); */
    const customer = await prisma.customer.findFirst({
      where: {
        shopId,
        email,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, customer.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Return customer data (without password)
    return NextResponse.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}