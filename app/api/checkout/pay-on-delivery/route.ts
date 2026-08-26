import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { es } from 'zod/v4/locales';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, addressId, items } = body;

    // Get customer and address
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { shop: true },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate totals
    // @typescript-eslint/no-explicit-any
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const tax = 0; // Implement tax calculation
    const shipping = 0; // Implement shipping calculation
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        shopId: customer.shopId,
        customerId,
        addressId,
        orderNumber,
        status: 'pending',
        subtotal,
        tax,
        shipping,
        total,
        paymentStatus: 'pending',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variationId: item.variationId || null,
            productName: item.productName,
            variationName: item.variationName || null,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, order });
    }  catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}