// src/components/admin/ProductVariationsManager.tsx
'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Variation {
  id?: string;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes: Record<string, string>;
}

interface ProductVariationsManagerProps {
  productId: string;
  shopId: string;
  initialVariations?: Variation[];
}

export function ProductVariationsManager({
  productId,
  shopId,
  initialVariations = [],
}: ProductVariationsManagerProps) {
  const [variations, setVariations] = useState<Variation[]>(initialVariations);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: 0,
    size: '',
    color: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const variation: Variation = {
      name: formData.name || `${formData.size} / ${formData.color}`,
      sku: formData.sku,
      price: formData.price ? parseFloat(formData.price) : undefined,
      stock: formData.stock,
      attributes: {
        ...(formData.size && { size: formData.size }),
        ...(formData.color && { color: formData.color }),
      },
    };

    try {
      const response = await fetch(`/api/shops/${shopId}/products/${productId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variation),
      });

      if (response.ok) {
        const saved = await response.json();
        setVariations([...variations, saved]);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save variation:', error);
    }
  };

  const handleDelete = async (variationId: string, index: number) => {
    if (!confirm('Delete this variation?')) return;

    try {
      const response = await fetch(
        `/api/shops/${shopId}/products/${productId}/variations/${variationId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setVariations(variations.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error('Failed to delete variation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      price: '',
      stock: 0,
      size: '',
      color: '',
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Product Variations</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Variation
        </button>
      </div>

      {/* Variation Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Size (e.g., Small, Medium)"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Color (e.g., Red, Blue)"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="px-3 py-2 border rounded"
            />
          </div>

          <input
            type="text"
            placeholder="Display Name (optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price Override"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              required
              className="px-3 py-2 border rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Variation
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Variations List */}
      {variations.length > 0 ? (
        <div className="space-y-2">
          {variations.map((variation, index) => (
            <div key={variation.id || index} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex-1">
                <p className="font-medium">{variation.name}</p>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  {variation.sku && <span>SKU: {variation.sku}</span>}
                  {variation.price && <span>Price: ${variation.price.toFixed(2)}</span>}
                  <span>Stock: {variation.stock}</span>
                </div>
                {Object.keys(variation.attributes).length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {Object.entries(variation.attributes).map(([key, value]) => (
                      <span key={key} className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {variation.id && (
                <button
                  onClick={() => handleDelete(variation.id!, index)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No variations added yet
        </p>
      )}
    </div>
  );
}



