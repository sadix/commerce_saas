// src/themes/pet-shop/components/Header.tsx
'use client';

import { ShoppingCart, User, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Header({ shopData, pages = [] }: any) {
  const { itemCount, setIsOpen } = useCart();
  
  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          🐶 Free Treats with Every Order | 🐱 Shop Now, Smile Later
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href={`/store/${shopData.subdomain}/`} className="flex items-center gap-3">
            {shopData.logoUrl && (
              <img src={shopData.logoUrl} alt="Logo" className="h-12 w-12" />
            )}
            <div>
              <div className="text-2xl font-bold text-purple-600">{shopData.name}</div>
              <div className="text-xs text-gray-600">Where Pets Come First 🐾</div>
            </div>
          </a>
          
          <nav className="hidden md:flex gap-8">
            <a href={`/store/${shopData.subdomain}/products/dogs`} className="flex items-center gap-2 text-gray-700 hover:text-purple-600 font-medium">
              🐕 Dogs
            </a>
            <a href={`/store/${shopData.subdomain}/products/cats`} className="flex items-center gap-2 text-gray-700 hover:text-purple-600 font-medium">
              🐈 Cats
            </a>
            <a href={`/store/${shopData.subdomain}/products/birds`} className="flex items-center gap-2 text-gray-700 hover:text-purple-600 font-medium">
              🦜 Birds
            </a>
            <a href={`/store/${shopData.subdomain}/sale`} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold">
              🏷️ Sale
            </a>
          </nav>
          
          <div className="flex items-center gap-4">
            <button className="hover:text-pink-600 transition">
              <Heart className="w-6 h-6" />
            </button>
            <a href={`/store/${shopData.subdomain}/account`} className="hover:text-purple-600 transition">
              <User className="w-6 h-6" />
            </a>
            <button onClick={() => setIsOpen(true)} className="relative hover:text-purple-600 transition">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
