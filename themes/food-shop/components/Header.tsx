// src/themes/food-shop/components/Header.tsx
'use client';

import React from 'react';
import { ShoppingCart, User, Search, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Header({ shopData, pages = [] }: any) {
  const { itemCount, setIsOpen } = useCart();
  
  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-orange-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Free delivery on orders over $50</span>
          </div>
          <div className="flex gap-4">
            <a href="/track-order" className="hover:underline">Track Order</a>
            <a href="/help" className="hover:underline">Help</a>
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          <a href={`/store/${shopData.subdomain}/`} className="flex items-center gap-3">
            {shopData.logoUrl && (
              <img src={shopData.logoUrl} alt="Logo" className="h-12 w-12 object-contain" />
            )}
            <span className="text-2xl font-bold text-orange-600">{shopData.name}</span>
          </a>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for fresh produce, dairy, and more..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-full focus:border-orange-600 focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 text-white rounded-full">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href={`/store/${shopData.subdomain}/account`} className="flex flex-col items-center text-gray-700 hover:text-orange-600">
              <User className="w-6 h-6" />
              <span className="text-xs">Account</span>
            </a>
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex flex-col items-center text-gray-700 hover:text-orange-600"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-xs">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex gap-8 mt-4 pt-4 border-t">
          {pages.filter((p: any) => p.showInNav).map((page: any) => (
            <a
              key={page.slug}
              href={`/store/${shopData.subdomain}/${page.slug}`}
              className="text-gray-700 hover:text-orange-600 font-medium transition"
            >
              {page.title}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}