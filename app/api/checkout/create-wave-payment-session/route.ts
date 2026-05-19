// src/app/api/checkout/confirm-order/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const  authorization = request.headers.get('Authorization');
   const amount = body.amount;
    const api_url_test = "https://epsie-startup.com/wave/api/v1/checkout/sessions";
    const api_url_prod = "https://api.wave.com/v1/checkout/sessions";
    //const payment_utl = "https://pay.wave.com/m/M_sn_36kJZkh0MiqA/c/sn/?amount=" + amount;

    const response = await fetch(api_url_prod, {
      method: 'POST',
      headers: {
        'Authorization': ` ${authorization}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });
    //const response2 = await fetch(payment_utl);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Wave API error:', errorData);
      return NextResponse.json({ error: 'Failed to create Wave payment session' }, { status: 500 });
    }

    return response.json();
  } catch (error) {
    console.error('Confirm order error:', error);
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 });
  }
}