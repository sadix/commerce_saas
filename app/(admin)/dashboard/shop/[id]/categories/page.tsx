// src/app/(admin)/dashboard/shop/[id]/categories/page.tsx

import { prisma } from '@/lib/prisma';
import { CategoriesList } from '@/components/admin/CategoriesList';
import { CategoryFormModal } from '@/components/admin/CategoryFormModal';

export default async function CategoriesPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const categories = await prisma.category.findMany({
    where: { shopId: id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-gray-600">Organize your products into categories</p>
        </div>
        <CategoryFormModal shopId={id} trigger="button" />
      </div>

      <CategoriesList categories={categories} shopId={id} />
    </div>
  );
}