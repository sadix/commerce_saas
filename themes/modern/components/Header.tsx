import React from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  shopData: { name: string; logoUrl?: string; subdomain?: string };
  pages?: Array<{
    title: string;
    slug: string;
    showInNav?: boolean;
  }>;
}

export default function Header({ shopData, pages  }: HeaderProps) {
  const { itemCount, setIsOpen } = useCart();
  const navPages = pages?.filter(page => page.showInNav !== false) || [];
  return (
    <header className="bg-black shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {shopData.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shopData.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
          
          )}
          <h1 className="text-xl font-bold">{shopData.name}</h1>
        </div>
      {navPages.length > 0 && (
          <nav className="hidden md:flex gap-6 ">
            {navPages.map((page) => (
              <a
                key={page.slug}
                href={`/store/${shopData.subdomain}/${page.slug}`}
                className="text-gray-500 hover:text-white transition font-medium "
              >
                {page.title}
              </a>
            ))}
          </nav>
        )}

        {/* Mobile menu button */}
        {navPages.length > 0 && (
          <button className="md:hidden p-2 text-gray-700 hover:text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      

      {/* Mobile menu */}
      {navPages.length > 0 && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-2">
            {navPages.map((page) => (
              <a
                key={page.slug}
                href={`/store/${shopData.subdomain}/${page.slug}`}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded font-medium"
              >
                {page.title}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Right Side Icons */}
        <div className="flex items-center gap-4">
          <a
            href={`/store/${shopData.subdomain}/account`}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Account"
          >
            <User className="w-5 h-5 text-gray-700" />
          </a>
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
    </header>
  );
}