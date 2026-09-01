// src/app/(admin)/dashboard/shop/[id]/pages/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageEditor } from '@/components/admin/PageEditor';
import { PagesManager } from '@/components/admin/PagesManager';
import {getTranslations} from 'next-intl/server';
import { PageMenuOrderManager } from '@/components/admin/PageMenuOrderManager';

export default async function PagesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('admin.shop_pages');

  const { id } = await params;
  
  if (!session?.user) {
    redirect('/login');
  }
  //console.log('Shop ID:', params?.id);
  const shop = await prisma.shop.findUnique({
    where: { id: id },
    include: {
      pages: true,
      theme: true,
    },
  });

  /* const shop = await prisma.shop.findUnique({
    where: { id: "cmkd13lzq0003fcw0b183s8iy" },
    include: {
      pages: true,
      theme: true,
    },
  }); */

  if (!shop || shop.userId !== session.user.id) {
    redirect('/dashboard');
  }



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-gray-600">{t('description')}</p>
        </div>
      </div>

      <PagesManager shopId={shop.id} pages={shop.pages} />
      <PageMenuOrderManager shopId={shop.id} initialPages={shop.pages.map((p) => ({ id: p.id, title: p.title, slug: p.slug, weight: p.weight ?? 0, published: p.published ?? false, isHome: p.isHome ?? false }))} />
    </div>
    /* <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">{shop.name} - Pages</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageEditor shopId={shop.id} pages={shop.pages} />
      </div>
    </div> */
    
    
  );
}