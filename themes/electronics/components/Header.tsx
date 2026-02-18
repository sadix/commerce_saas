// src/themes/electronics/components/Header.tsx
'use client';

import { ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';


interface HeaderProps {
  shopData: { name: string; logoUrl?: string; subdomain?: string };
  pages?: Array<{
    title: string;
    slug: string;
    showInNav?: boolean;
  }>;
}

export default function Header({ shopData, pages = [] }: HeaderProps) {
  const { itemCount, setIsOpen } = useCart();
  const navPages = pages?.filter((page:any) => page.showInNav !== false) || [];
  const [mobileMenutoggle, setMobileMenuToggle] = useState(false);
  
  return (
    <header className="bg-black text-white border-b border-gray-800 sticky top-0 z-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-2">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm font-medium">
          🎉 Big Tech Sale - Up to 50% Off | Free Shipping Over $100
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href={`/`} className="flex items-center gap-3">
            {shopData.logoUrl && (
              <img src={shopData.logoUrl} alt="Logo" className="h-10 w-10" />
            )}
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {shopData.name}
            </span>
          </a>

          {navPages.length > 0 && (
          <nav className="hidden md:flex gap-6">
            {navPages.map((page) => (
              <a
                key={page.slug}
                href={`/${page.slug}`}
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                {page.title}
              </a>
            ))}
          </nav>
        )}
          
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href={`/account`} className="hover:text-blue-400 transition">
              <User className="w-6 h-6" />
            </a>
            <button onClick={() => setIsOpen(true)} className="relative hover:text-blue-400 transition">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

         {/* Mobile menu button */}
        {navPages.length > 0 && (
          <button className="md:hidden p-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuToggle(!mobileMenutoggle)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
       

        {/* Mobile menu */}
      {navPages.length > 0 && mobileMenutoggle && (
        <div className="md:hidden absolute w-full top-2 left-0  bg-white z-10">
          <button className="absolute right-2 top-2 p-2 text-black z-10 " onClick={() => setMobileMenuToggle(!mobileMenutoggle)}>
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="flex flex-col p-4 space-y-2 gap-8 mt-4 pt-4 border-t border-gray-800">
            {navPages.map((page:any) => (
              <a
                key={page.slug}
                href={`/${page.slug}`}
                className="px-4 py-2 text-gray-700 hover:text-blue-400 transitionrounded font-medium"
              >
                {page.title}
              </a>
            ))}
          </nav>
        </div>
      )}
        


      </div>
    </header>
  );
}