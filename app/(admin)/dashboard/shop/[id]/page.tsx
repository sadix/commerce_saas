// src/app/(admin)/dashboard/shop/[id]/page.tsx

import { prisma } from '@/lib/prisma';
import { Package, FileText, FolderTree, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
  }>;
}

export default async function ShopOverviewPage({ params }: ReqParamProps) {
  const { id } = await params;
  const shop = await prisma.shop.findUnique({
    where: { id: id },
    include: {
      _count: {
        select: {
          pages: true,
          products: true,
        },
      },
      theme: true,
    },
  });

  if (!shop) {
    return <div>Shop not found</div>;
  }

  const stats = [
    {
      name: 'Pages',
      value: shop._count.pages,
      icon: FileText,
      href: `/dashboard/shop/${id}/pages`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      name: 'Products',
      value: shop._count.products,
      icon: Package,
      href: `/dashboard/shop/${id}/products`,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      name: 'Categories',
      value: 0, // Will be updated when categories are added
      icon: FolderTree,
      href: `/dashboard/shop/${id}/categories`,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Store Overview</h2>
        <p className="text-gray-600">Manage your store and view statistics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Store Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Store Name</label>
            <p className="font-medium">{shop.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Store URL</label>
            <div className="flex items-center gap-2">
              <p className="font-medium">{shop.subdomain}.yourdomain.com</p>
              <a
                href={`/store/${shop.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Active Theme</label>
            <p className="font-medium">{shop.theme?.name || 'No theme selected'}</p>
          </div>
          {shop.description && (
            <div>
              <label className="text-sm text-gray-600">Description</label>
              <p className="font-medium">{shop.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href={`/dashboard/shop/${id}/products?action=new`}
            className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
          >
            <Package className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">Add Product</p>
          </Link>
          <Link
            href={`/dashboard/shop/${id}/pages`}
            className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
          >
            <FileText className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">Edit Pages</p>
          </Link>
        </div>
      </div>
    </div>
  );
}