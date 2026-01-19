// src/app/(admin)/dashboard/shop/[id]/products/page.tsx

import { prisma } from '@/lib/prisma';
import { ProductsList } from '@/components/admin/ProductsList';
import { ProductFormModal } from '@/components/admin/ProductFormModal';

export default async function ProductsPage({ 
  params,
  searchParams,
}: { 
  params: { id: string };
  searchParams: { action?: string };
}) {
    const { id } = await params;
    const {action} = await searchParams;
  const products = await prisma.product.findMany({
    where: { shopId: id },
    orderBy: { created_at: 'desc' },
  });

  const showNewForm = action === 'new';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-gray-600">Manage your store products</p>
        </div>
        <ProductFormModal shopId={id} trigger="button" />
      </div>

      <ProductsList products={products} shopId={id} />
    </div>
  );
}