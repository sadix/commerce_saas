// src/themes/bike-shop/components/Header.tsx
'use client';

import React from 'react';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export default function Header({ shopData, pages = [],buttonText1 = 'About',
  buttonLink1 = '/about',buttonText2 = 'Contact',
  buttonLink2 = '/contact' }: any) {
  const { itemCount, setIsOpen } = useCart();
  const navPages = pages.filter((page: any) => page.showInNav !== false);
  const [mobileMenutoggle, setMobileMenuToggle] = useState(false);
  
  return (
    <header className="bg-green-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Bar */}
        <div className="border-b border-green-600 py-2 text-sm">
          <div className="flex justify-between items-center">
            <span>🚴 Free Shipping on Orders Over $100</span>
            <div className="flex gap-4">
              <a href={buttonLink1} className="hover:text-green-200">{buttonText1}</a>
              <a href={buttonLink2} className="hover:text-green-200">{buttonText2}</a>
            </div>
          </div>
        </div>
        
        {/* Main Header */}
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shopData.logoUrl && (
              <img src={shopData.logoUrl} alt="Logo" className="h-12 w-12 object-contain" />
            )}
            <a href={`/`}className="text-2xl font-bold hover:text-green-200 transition">
              {shopData.name}
            </a>
          </div>
          
          <nav className="hidden md:flex gap-8">
            {navPages.map((page: any) => (
              <a
                key={page.slug}
                href={`/${page.slug}`}
                className="font-medium hover:text-green-200 transition"
              >
                {page.title}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href={`/account`} className="p-2 hover:bg-green-600 rounded-full transition">
              <User className="w-5 h-5" />
            </a>
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 hover:bg-green-600 rounded-full transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileMenuToggle(!mobileMenutoggle)} >
              <Menu className="w-6 h-6" />
            </button>
            {/* Mobile menu */}
            {navPages.length > 0 && mobileMenutoggle && (
              <div className="md:hidden absolute w-full top-2 left-0 bg-green-700 text-white   z-10">
                <button className="absolute right-2 top-2 p-2 text-white z-10 " onClick={() => setMobileMenuToggle(!mobileMenutoggle)}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <nav className="flex flex-col p-4 space-y-2">
                  {navPages.map((page:any) => (
                    <a
                      key={page.slug}
                      href={`/${page.slug}`}
                      className="px-4 py-2  hover:bg-gray-50 rounded font-medium"
                    >
                      {page.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}