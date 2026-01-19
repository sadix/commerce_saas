// src/themes/default/components/CategoryShowcase.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface CategoryShowcaseProps {
  title?: string;
  subtitle?: string;
  shopId?: string;
  layout?: 'grid' | 'horizontal';
}

export default function CategoryShowcase({
  title = 'Shop by Category',
  subtitle = 'Explore our collections',
  shopId,
  layout = 'grid',
}: CategoryShowcaseProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchCategories();
    }
  }, [shopId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-gray-500">Loading categories...</div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        {/* Categories */}
        {layout === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 hover:shadow-xl transition-all"
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">
                    {category._count.products} {category._count.products === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex-shrink-0 w-64 h-32 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl transition-all p-6 text-white"
              >
                <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                <p className="text-sm opacity-90">
                  {category._count.products} {category._count.products === 1 ? 'item' : 'items'}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
