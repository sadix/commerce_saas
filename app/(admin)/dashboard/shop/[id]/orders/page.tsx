// src/app/(admin)/dashboard/shop/[id]/orders/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { OrdersManager } from '@/components/admin/OrdersManager';

export default async function OrdersPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const { id } = await params;
  
  if (!session?.user) {
    redirect('/login');
  }

  const shop = await prisma.shop.findUnique({
    where: { id },
  });

  if (!shop || shop.userId !== session.user.id) {
    redirect('/dashboard');
  }

  const orders = await prisma.order.findMany({
    where: { shopId: id },
    include: {
      customer: true,
      address: true,
      items: {
        include: {
          product: true,
          variation: true,
        },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-gray-600">Manage customer orders</p>
        </div>
      </div>

      <OrdersManager orders={orders} shopId={id} />
    </div>
  );
}

