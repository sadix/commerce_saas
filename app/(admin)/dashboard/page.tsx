// src/app/(admin)/dashboard/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {Shop, Theme} from '@prisma/client';
import { Store, FileText, LayoutDashboard  } from 'lucide-react';
import { rootDomain,  } from '@/lib/utils';

interface ShopWithTheme extends Shop {
  theme: Theme | null;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const shops = await prisma.shop.findMany({
    where: { userId: session.user.id },
    include: { theme: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Stores</h2>
          <Link
            href="/dashboard/create-shop"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New Store
          </Link>
        </div>

        {shops.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Store className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No stores yet</h3>
            <p className="text-gray-600 mb-6">Create your first online store to get started</p>
            <Link
              href="/dashboard/create-shop"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Your First Store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop: ShopWithTheme) => (
              <div key={shop.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  {shop.logoUrl && (
                    <img
                      src={shop.logoUrl}
                      alt={shop.name}
                      className="w-16 h-16 object-contain mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{shop.name}</h3>
                  <p className="text-gray-600 mb-4">{shop.subdomain}.{rootDomain}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    Theme: {shop.theme?.name || 'None'}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/shop/${shop.id}/`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded hover:bg-gray-50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Overview
                    </Link>
                    <Link
                      href={`/dashboard/shop/${shop.id}/pages`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded hover:bg-gray-50"
                    >
                      <FileText className="w-4 h-4" />
                      Pages
                    </Link>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}