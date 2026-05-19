// src/components/admin/ShopSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {useState} from 'react';
import { 
  FileText, 
  Package, 
  FolderTree, 
  Palette, 
  Settings,
  LayoutDashboard,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {useTranslations} from 'next-intl';

interface ShopSidebarProps {
  shopId: string;
}

export function ShopSidebar({ shopId }: ShopSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const t = useTranslations('admin.shop_layout.shop_sidebar');
  const navigation = [
    {
      name: t('overview'),
      href: `/dashboard/shop/${shopId}`,
      icon: LayoutDashboard,
    },
    {
      name: t('pages'),
      href: `/dashboard/shop/${shopId}/pages`,
      icon: FileText,
    },
    {
      name: t('products'),
      href: `/dashboard/shop/${shopId}/products`,
      icon: Package,
    },
    {
      name: t('collections'),
      href: `/dashboard/shop/${shopId}/categories`,
      icon: FolderTree,
    },
    {
      name: t('customers'),
      href: `/dashboard/shop/${shopId}/customers`,
      icon: User,
    },
    {
      name: t('orders'),
      href: `/dashboard/shop/${shopId}/orders`,
      icon: Package,
    },
    
    {
      name: t('theme'),
      href: `/dashboard/shop/${shopId}/theme`,
      icon: Palette,
    },
    {
      name: t('settings'),
      href: `/dashboard/shop/${shopId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <>
    <div className={cn(isExpanded? 'w-64': 'w-20', 'hidden  transition-all duration-300 ease-in-out md:flex h-auto')}>
    <aside className=" bg-white border-r min-h-screen overflow-y-auto  md:relative">
      <nav className=" p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {isExpanded && item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
     <div className='relative'>
       <button
         onClick={() => setIsExpanded(!isExpanded)}
         className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-1 shadow-md hover:bg-gray-50"
       >
         {isExpanded ? '◀' : '▶'}
       </button>
     </div>
    </div>


    {/* Mobile menu button */}
        {navigation.length > 0 && (
          <button className="md:hidden flex p-2 text-gray-700 hover:text-blue-600 flex items-center gap-2" onClick={() => setIsExpanded(!isExpanded)}>
            Menu
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      

      {/* Mobile menu */}
      {navigation.length > 0 && !isExpanded && (
        <div className="md:hidden absolute w-full top-2 left-0  bg-white z-10">
          <button className="absolute right-2 top-2 p-2 text-black z-10 " onClick={() => setIsExpanded(!isExpanded)}>
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="flex flex-col p-4 space-y-2">
            {navigation.map((page) => (
              <a
                key={page.name}
                href={`${page.href}`}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded font-medium"
              > {page.icon && <page.icon className="w-5 h-5 inline-block mr-2" />}
                {page.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}