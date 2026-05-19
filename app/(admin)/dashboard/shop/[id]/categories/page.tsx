// src/app/(admin)/dashboard/shop/[id]/categories/page.tsx

import { prisma } from '@/lib/prisma';
import { CategoriesList } from '@/components/admin/CategoriesList';
import { CategoryFormModal } from '@/components/admin/CategoryFormModal';
import {getTranslations} from 'next-intl/server';

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

  const t = await getTranslations('admin.shop_collections');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        <CategoryFormModal shopId={id} trigger="button" />
      </div>

      <CategoriesList categories={categories} shopId={id} />
    </div>
  );
}