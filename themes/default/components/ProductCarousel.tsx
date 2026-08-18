// src/themes/default/components/ProductCarousel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import {useThemeSettings} from '@/theme-settings';

interface ProductCarouselProps {
  title?: string;
  shopId?: string;
  limit?: number;
}

export default function ProductCarousel({
  title = 'Best Sellers',
  shopId,
  limit = 12,
}: ProductCarouselProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addItem } = useCart();

  const { colors , shape, components, typography} = useThemeSettings ();

  useEffect(() => {
    if (shopId) {
      fetchProducts();
    }
  }, [shopId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.filter((p: any) => p.published).slice(0, limit));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const itemsToShow = 4;
  const maxIndex = Math.max(0, products.length - itemsToShow);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white" style={{backgroundColor:colors.surface}}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900" style={{ color:colors.primary, fontFamily:typography.fontDisplay, fontWeight:typography.fontWeightDisplay}}>{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{borderRadius:shape.radiusSmall, borderColor:colors.border}}
            >
              <ChevronLeft className="w-5 h-5"   />
            </button> 
            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{borderRadius:shape.radiusSmall, borderColor:colors.border}}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-transform duration-300"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 lg:w-[calc(25%-1.125rem)]"
              >
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition" style={{borderRadius:shape.radiusMedium, borderColor:colors.border}}>
                  <div className="aspect-square bg-gray-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4" style={{ backgroundColor:colors.primaryForeground}}>
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      FCFA {product.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => addItem(product)}
                      className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      style={{ backgroundColor:colors.primary, borderRadius:shape.radiusMedium}}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}