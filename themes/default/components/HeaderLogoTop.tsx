import React from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import {useThemeSettings} from '@/theme-settings';

interface HeaderProps {
  shopData: { name: string; logoUrl?: string; subdomain?: string };
  pages?: Array<{
    title: string;
    slug: string;
    showInNav?: boolean;
    weight?: number;
  }>;
}

export default function HeaderLogoTop({ shopData, pages  }: HeaderProps) {
  const { itemCount, setIsOpen } = useCart();
  const navPages = pages?.filter((page:any) => page.showInNav !== false).sort((a, b) => (a.weight || 0) - (b.weight || 0)) || [];
  const [mobileMenutoggle, setMobileMenuToggle] = useState(false);

  const { colors , shape, components, typography, settings} = useThemeSettings ();
  console.log('Header settings:', settings);
  return (
    <header className="bg-white shadow-sm"  style={{ background: colors.background, color: colors.text, fontFamily: typography.fontBody, borderColor: colors.border }}>
      <div className="max-w-7xl mx-auto px-4 py-4  items-center justify-between">
        <div className="flex items-center items-center gap-3 mb-4">
          {shopData.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shopData.logoUrl} alt="Logo" className="h-10 w-10 object-contain mx-auto" />
          
          )}
          <h1 className="text-xl font-bold mx-auto" style={{ color: colors.text, fontFamily: typography.fontDisplay }}>
            {shopData.name}
          </h1>
        </div>
      <div className="flex items-center gap-3">
      {navPages.length > 0 && (
          <nav className="hidden md:flex gap-6 mx-auto">
            {navPages.map((page) => (
              <a
                key={page.slug}
                href={`/${page.slug}`}
                className={`menu-item text-gray-700 hover:text-[${colors.accent}] transition font-medium`}
                style={{ color: colors.text  }}
              >
                {page.title}
              </a>
            ))}
          </nav>
        )}
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
          <nav className="flex flex-col p-4 space-y-2">
            {navPages.map((page:any) => (
              <a
                key={page.slug}
                href={`/${page.slug}`}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded font-medium"
              >
                {page.title}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Right Side Icons */}
        <div className="flex justify-end items-center gap-4">
          <a
            href={`/account`}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Account"
          >
            <User className="w-5 h-5 text-gray-700" style={{ color: colors.primary }} />
          </a>
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" style={{ color: colors.primary }} />
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