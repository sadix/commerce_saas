// src/components/admin/ProductFormModal.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { Product } from '@prisma/client';
import { X, Plus, Edit } from 'lucide-react';
import { ProductVariationsManager } from './ProductVariationsManager';
import { th } from 'zod/v4/locales';

interface ProductFormModalProps {
  shopId: string;
  product?: Product;
  trigger: 'button' | 'icon';
  
}

interface Variation {
  id?: string;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes: Record<string, string>;
}

export function ProductFormModal({ shopId, product, trigger }: ProductFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    published: product?.published || false,
    images: product?.images ?? [],
    categoryId: product?.categoryId ?? '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]); // Placeholder for categories, replace with actual data fetching if needed
  const [variations, setVariations] = useState<Variation[]>([]);
  useEffect(() => {
    // Fetch categories for the shop
    async function fetchCategories() {      
      const res = await fetch(`/api/shops/${shopId}/categories`, { method: 'GET' });
      const data = await res.json();
      console.log(data);
      setCategories(data);
    }
    async function fetchVariations() {      
      const res = await fetch(`/api/shops/${shopId}/products/${product?.id}/variations`, { method: 'GET' });
      const data = await res.json();
      const variationsArray: Variation[] = data;
      setVariations(variationsArray);
    }
    fetchCategories();
    fetchVariations();
  }, [shopId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    

    try {

      //image upload logic to be added here
      //let imageUrl = formData.images;

       if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData,
        });

        if (!uploadRes.ok) {
            throw new Error('Image upload failed');
        }

        const uploadResult = await uploadRes.json();
        const newImageUrl = uploadResult.url;
        formData.images=[newImageUrl];
       }
      //image upload logic to be added here
      /* if(variations.length === 0){
        setError('Please add at least one variation before saving the product.');
        setLoading(false);
        return;
      } */
        if(formData.categoryId === ''){
          setError('Please select a category for the product.');
          setLoading(false);
          return;
        }

      const url = product
        ? `/api/shops/${shopId}/products/${product.id}`
        : `/api/shops/${shopId}/products`;
      
      const method = product ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsOpen(false);
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save product');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger === 'button' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="text-blue-600 hover:text-blue-900"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Premium T-Shirt"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="published"
                  name="published"
                  type="checkbox"
                  checked={formData.published}
                  onChange={handleCheckbox}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  Publish product (make it visible in your store)
                </label>
              </div>

             {/* image upload to be added here */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                </label>

                {formData.images && (
                    <img src={imageFile ? URL.createObjectURL(imageFile) : formData.images[0]} alt="Product preview"  className="mb-3 h-32 rounded-md object-cover border" />
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
            </div>


             {/* image upload end */}
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                </label>
                <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
            {product && (
            <ProductVariationsManager  productId={product?.id} shopId={shopId}  initialVariations={variations} />)}
          </div>
        </div>
      )}
    </>
  );
}