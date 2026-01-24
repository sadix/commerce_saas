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

interface ShopSidebarProps {
  shopId: string;
}

export function ShopSidebar({ shopId }: ShopSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Overview',
      href: `/dashboard/shop/${shopId}`,
      icon: LayoutDashboard,
    },
    {
      name: 'Pages',
      href: `/dashboard/shop/${shopId}/pages`,
      icon: FileText,
    },
    {
      name: 'Products',
      href: `/dashboard/shop/${shopId}/products`,
      icon: Package,
    },
    {
      name: 'Categories',
      href: `/dashboard/shop/${shopId}/categories`,
      icon: FolderTree,
    },
    {
      name: 'Customers',
      href: `/dashboard/shop/${shopId}/customers`,
      icon: User,
    },
    {
      name: 'Orders',
      href: `/dashboard/shop/${shopId}/orders`,
      icon: Package,
    },
    
    {
      name: 'Theme',
      href: `/dashboard/shop/${shopId}/theme`,
      icon: Palette,
    },
    {
      name: 'Settings',
      href: `/dashboard/shop/${shopId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className={cn(isExpanded? 'w-64': 'w-20', 'transition-all duration-300 ease-in-out sm:flex h-fill')}>
    <aside className=" bg-white border-r min-h-screen overflow-y-auto relative">
      <nav className="p-4 space-y-1">
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
  );
}