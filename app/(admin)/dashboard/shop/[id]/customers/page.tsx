// src/app/(admin)/dashboard/shop/[id]/customers/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CustomersManager } from '@/components/admin/CustomersManager';

export default async function CustomersPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
  if (!session?.user) {
    redirect('/login');
  }

  const shop = await prisma.shop.findUnique({
    where: { id: id },
  });

  if (!shop || shop.userId !== session.user.id) {
    redirect('/dashboard');
  }

  const customers = await prisma.customer.findMany({
    where: { shopId: id },
    include: {
      _count: {
        select: { orders: true },
      },
      orders: {
        select: {
          total: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-gray-600">Manage your customers</p>
        </div>
      </div>

      <CustomersManager customers={customers} shopId={params.id} />
    </div>
  );
}

