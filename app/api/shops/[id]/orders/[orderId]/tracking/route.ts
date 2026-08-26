import { NextResponse,NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
    orderId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const session = await getServerSession(authOptions); 
 if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
 const { id, orderId } = await params;

 const body = await request.json();

const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: true },
  });

if (!order || order.shop.userId !== session.user.id) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
}

const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      ...body,
    },
  });

    logActivity('Order Updated', session.user.id, { orderId }, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "unknown ip address");

return NextResponse.json(updatedOrder);
}