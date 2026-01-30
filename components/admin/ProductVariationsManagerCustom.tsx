// src/components/admin/ProductVariationsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

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
  categoryId?: string; // Optional category ID for loading attributes
  mode?: 'dynamic' | 'category'; // Mode: dynamic (v1) or category-based (v2)
}

interface AttributeDefinition {
  name: string;
  type: 'text' | 'select';
  options?: string[];
  required?: boolean;
}

// Shopify Standard Product Taxonomy attribute mappings
const CATEGORY_ATTRIBUTES: Record<string, AttributeDefinition[]> = {
  'apparel': [
    { name: 'Size', type: 'select', options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'], required: true },
    { name: 'Color', type: 'select', options: ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Beige'], required: true },
    { name: 'Material', type: 'select', options: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather', 'Synthetic'] },
    { name: 'Fit', type: 'select', options: ['Slim', 'Regular', 'Relaxed', 'Oversized'] },
  ],
  'footwear': [
    { name: 'Size', type: 'select', options: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'], required: true },
    { name: 'Width', type: 'select', options: ['Narrow', 'Medium', 'Wide', 'Extra Wide'] },
    { name: 'Color', type: 'select', options: ['Black', 'White', 'Brown', 'Gray', 'Navy', 'Red', 'Blue', 'Tan'], required: true },
  ],
  'electronics': [
    { name: 'Color', type: 'select', options: ['Black', 'White', 'Silver', 'Gray', 'Gold', 'Rose Gold', 'Blue', 'Red'], required: true },
    { name: 'Storage', type: 'select', options: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'] },
    { name: 'Memory', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
  ],
  'home-garden': [
    { name: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'X-Large'], required: true },
    { name: 'Color', type: 'select', options: ['White', 'Black', 'Gray', 'Brown', 'Beige', 'Blue', 'Green', 'Red'], required: true },
    { name: 'Material', type: 'select', options: ['Wood', 'Metal', 'Plastic', 'Glass', 'Fabric', 'Ceramic'] },
  ],
  'beauty': [
    { name: 'Size', type: 'select', options: ['Travel Size', 'Regular', 'Value Size', 'Jumbo'], required: true },
    { name: 'Shade', type: 'text', required: false },
    { name: 'Scent', type: 'select', options: ['Unscented', 'Lavender', 'Rose', 'Citrus', 'Vanilla', 'Mint'] },
  ],
  'cmkzfoxa4000oh8w08yp5smdx': [
    { name: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
    { name: 'Color', type: 'select', options: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange'], required: true },
    { name: 'Weight', type: 'select', options: ['5 lbs', '10 lbs', '15 lbs', '20 lbs', '25 lbs', '30 lbs'] },
  ],
};

export function ProductVariationsManagerCustom({
  productId,
  shopId,
  initialVariations = [],
  categoryId,
  mode = 'dynamic',
}: ProductVariationsManagerProps) {
  const [variations, setVariations] = useState<Variation[]>(initialVariations);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: 0,
  });

  // Dynamic attributes state (v1)
  const [customAttributes, setCustomAttributes] = useState<Record<string, string>>({});
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');

  // Category-based attributes (v2)
  const [categoryAttributes, setCategoryAttributes] = useState<AttributeDefinition[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});

  // Load category attributes when category changes (v2)
  useEffect(() => {
    if (mode === 'category' && categoryId) {
      const attrs = CATEGORY_ATTRIBUTES[categoryId] || [];
      setCategoryAttributes(attrs);
      
      // Initialize attribute values
      const initialValues: Record<string, string> = {};
      attrs.forEach(attr => {
        initialValues[attr.name.toLowerCase()] = '';
      });
      setAttributeValues(initialValues);
    }
  }, [categoryId, mode]);

  // Add custom attribute (v1)
  const addCustomAttribute = () => {
    if (newAttributeName.trim() && newAttributeValue.trim()) {
      setCustomAttributes({
        ...customAttributes,
        [newAttributeName.toLowerCase()]: newAttributeValue,
      });
      setNewAttributeName('');
      setNewAttributeValue('');
    }
  };

  // Remove custom attribute (v1)
  const removeCustomAttribute = (key: string) => {
    const updated = { ...customAttributes };
    delete updated[key];
    setCustomAttributes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build attributes based on mode
    let attributes: Record<string, string> = {};
    
    if (mode === 'dynamic') {
      // v1: Use custom attributes
      attributes = { ...customAttributes };
    } else if (mode === 'category') {
      // v2: Use category-based attributes
      attributes = { ...attributeValues };
      
      // Validate required attributes
      const missingRequired = categoryAttributes
        .filter(attr => attr.required && !attributeValues[attr.name.toLowerCase()])
        .map(attr => attr.name);
      
      if (missingRequired.length > 0) {
        alert(`Please fill in required fields: ${missingRequired.join(', ')}`);
        return;
      }
    }

    // Auto-generate name from attributes if not provided
    const autoName = formData.name || Object.entries(attributes)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${value}`)
      .join(' / ') || 'Variation';

    const variation: Variation = {
      name: autoName,
      sku: formData.sku,
      price: formData.price ? parseFloat(formData.price) : undefined,
      stock: formData.stock,
      attributes,
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
    });
    setCustomAttributes({});
    setNewAttributeName('');
    setNewAttributeValue('');
    
    // Reset category attribute values
    const resetValues: Record<string, string> = {};
    categoryAttributes.forEach(attr => {
      resetValues[attr.name.toLowerCase()] = '';
    });
    setAttributeValues(resetValues);
    
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
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-4">
          {/* Mode: Dynamic Attributes (v1) */}
          {mode === 'dynamic' && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Attributes</h4>
              
              {/* Existing custom attributes */}
              {Object.keys(customAttributes).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(customAttributes).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 bg-white p-2 rounded border">
                      <span className="text-sm font-medium capitalize">{key}:</span>
                      <span className="text-sm flex-1">{value}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomAttribute(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new attribute */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Attribute name (e.g., Size, Color)"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., Large, Red)"
                  value={newAttributeValue}
                  onChange={(e) => setNewAttributeValue(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  type="button"
                  onClick={addCustomAttribute}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Mode: Category-based Attributes (v2) */}
          {mode === 'category' && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">
                Attributes {!categoryId && <span className="text-gray-500 text-xs">(Select a category first)</span>}
              </h4>
              
              {categoryAttributes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {categoryAttributes.map((attr) => (
                    <div key={attr.name}>
                      <label className="block text-sm font-medium mb-1">
                        {attr.name}
                        {attr.required && <span className="text-red-600">*</span>}
                      </label>
                      {attr.type === 'select' && attr.options ? (
                        <select
                          value={attributeValues[attr.name.toLowerCase()] || ''}
                          onChange={(e) => setAttributeValues({
                            ...attributeValues,
                            [attr.name.toLowerCase()]: e.target.value,
                          })}
                          required={attr.required}
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="">Select {attr.name}</option>
                          {attr.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={attributeValues[attr.name.toLowerCase()] || ''}
                          onChange={(e) => setAttributeValues({
                            ...attributeValues,
                            [attr.name.toLowerCase()]: e.target.value,
                          })}
                          required={attr.required}
                          placeholder={`Enter ${attr.name.toLowerCase()}`}
                          className="w-full px-3 py-2 border rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No attributes defined for this category
                </p>
              )}
            </div>
          )}

          {/* Common fields */}
          <div className="pt-3 border-t space-y-3">
            <input
              type="text"
              placeholder="Display Name (optional, auto-generated from attributes)"
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
            <div key={variation.id || index} className="flex items-center justify-between border rounded-lg p-3 bg-white">
              <div className="flex-1">
                <p className="font-medium">{variation.name}</p>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  {variation.sku && <span>SKU: {variation.sku}</span>}
                  {variation.price && <span>Price: ${variation.price.toFixed(2)}</span>}
                  <span>Stock: {variation.stock}</span>
                </div>
                {Object.keys(variation.attributes).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(variation.attributes).map(([key, value]) => (
                      value && (
                        <span key={key} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          <span className="font-medium capitalize">{key}:</span> {value}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
              {variation.id && (
                <button
                  onClick={() => handleDelete(variation.id!, index)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete variation"
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