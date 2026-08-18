// src/app/api/checkout/confirm-order/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity-logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentIntentId } = body;

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        paymentIntentId,
        status: 'processing',
      },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: true,
          },
        },
        shop: true,
      },
    });

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(order);
      await prisma.order.update({
        where: { id: orderId },
        data: { emailSent: true },
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the order if email fails
    }

    logActivity('Order Confirmed', 'system', { orderId }, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "unknown ip address");
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Confirm order error:', error);
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 });
  }
}