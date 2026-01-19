// src/components/admin/CategoriesList.tsx
'use client';

import { useState } from 'react';
import { Category } from '@prisma/client';
import { Edit, Trash2, FolderTree } from 'lucide-react';
import { CategoryFormModal } from './CategoryFormModal';

interface CategoriesListProps {
  categories: (Category & {
    _count: {
      products: number;
    };
  })[];
  shopId: string;
}

export function CategoriesList({ categories, shopId }: CategoriesListProps) {
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/shops/${shopId}/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete category');
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FolderTree className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
        <p className="text-gray-600 mb-6">Create categories to organize your products</p>
        <CategoryFormModal shopId={shopId} trigger="button" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-gray-500">
              {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
            </span>
            <div className="flex gap-2">
              <CategoryFormModal
                shopId={shopId}
                category={category}
                trigger="icon"
              />
              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}