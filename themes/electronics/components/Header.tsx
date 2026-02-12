// src/themes/electronics/components/Header.tsx
'use client';

import { ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Header({ shopData, pages = [] }: any) {
  const { itemCount, setIsOpen } = useCart();
  
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
        
        <nav className="hidden md:flex gap-8 mt-4 pt-4 border-t border-gray-800">
          {pages.filter((p: any) => p.showInNav).map((page: any) => (
            <a key={page.slug} href={`/${page.slug}`} className="hover:text-blue-400 transition">
              {page.title}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}