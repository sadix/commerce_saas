// src/themes/default/components/FeaturedProducts.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  shopId?: string;
  categoryFilter?: string;
  showNewProducts?: boolean;
}

export default function FeaturedProducts({
  title = 'Featured Products',
  subtitle = 'Check out our top picks',
  limit = 8,
  shopId,
  categoryFilter,
  showNewProducts = false,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (shopId) {
      fetchProducts();
    }
  }, [shopId, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/products`);
      if (response.ok) {
        let data = await response.json();
        
        // Filter published products
        data = data.filter((p: any) => p.published);
        
        // Filter by category if specified
        if (categoryFilter) {
          data = data.filter((p: any) => p.categoryId === categoryFilter);
        }
        
        // Sort by newest if specified
        if (showNewProducts) {
          data.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        
        setProducts(data.slice(0, limit));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-gray-500">Loading products...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  
                  {/* Badge for new products */}
                  {showNewProducts && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        NEW
                      </span>
                    </div>
                  )}
                  
                  {/* Sale badge */}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        SALE
                      </span>
                    </div>
                  )}

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="bg-white text-gray-900 px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform" onClick={() => setSelectedProduct(product)}>
                      <Eye className="w-4 h-4" />
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {product.category && (
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      {product.category.name}
                    </p>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  {product.stock > 0 ? (
                    <button
                      onClick={() => addItem(product)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No products available</div>
        )}
      </div>

      {selectedProduct && (shopId !== undefined) &&(
              <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                shopId={shopId} 
              />
            )}
    </section>
  );
}