import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSenePayCheckoutSession } from '@/lib/senepay';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { logActivity } from '@/lib/activity-logger';



export async function POST(req: NextRequest) {
  const auth_session = await getServerSession(authOptions);
  const user = auth_session?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* const { plan , provider } = (await req.json()) as { plan: PlanTier, provider: Provider };
  const planConfig = PLANS[plan];

  if (!planConfig || !planConfig.stripePriceId) {
    return NextResponse.json({ error: 'Invalid or unpurchasable plan' }, { status: 400 });
  } */
    const {amount, shopId, customerId, addressId, items} = (await req.json()) as {amount: number, shopId: string, productId: string, productName: string, productDescription: string, customerId: string, addressId: string, items: any[]};

    if (!amount || !shopId || !customerId || !addressId || !items || items.length === 0) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }


    
    // No customer/subscription object on SenePay's side — each period is
    // its own checkout session. orderReference doubles as our idempotency
    // key; metadata carries the userId/plan back to us on the webhook.
    const orderReference = `order_${customerId}_${shopId}_${Date.now()}`;

    const session = await createSenePayCheckoutSession({
      amount: amount,
      orderReference,
      description: `${items} from shop ${shopId}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/store/${shop.subdomain}/checkout?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/store/${shop.subdomain}/checkout?canceled=true`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/senepay-shop-checkout`,
      metadata: { shopId: shopId, customerId: customerId, addressId: addressId },
    });

    //console.log('webhook url:', `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/senepay`);

    //console.log('SenePay checkout session created:', session);

    return NextResponse.json({ url: session.checkoutUrl });


 
}
