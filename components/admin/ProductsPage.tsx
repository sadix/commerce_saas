// src/app/admin/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductFormModal } from '@/components/admin/ProductFormModalCustom';
import { ProductVariationsManager } from '@/components/admin/ProductVariationsManager';
import { Plus, Edit, Trash2, Package, Eye, EyeOff  } from 'lucide-react';
import { platform } from 'os';
import { CategoryPath, getCategoryAncestors } from '@/lib/categoryHelpers';
import {useTranslations} from 'next-intl';


interface Product {
  id: string;
  name: string;
  description: string;
  images:string;
  sku: string;
  price: number;
  stock: number;
  published: boolean;
  categoryId: string;
  platform_category: {
    id: string;
    name: string;
  }; 
  platform_categoryId: string;
 attributes: Array<{
    id: string;
    attributeId: string;
    value: string;
    attribute: {
      name: string;
    };
  }>; 
 /*  attributes: Array<{
    id: string;
    productId: string;
    attributeId: string;
    value: string;
    
  }>;  */
  variations: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
}

interface ProductsListProps {
  shopid: string;
}

export default  function ProductsListPage({ shopid }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  //const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [preparingEdit, setPreparingEdit] = useState(false);


  //Search Inputs
  const [searchInput, setSearchInput] = useState<string>('');
  
  // Replace with actual shop ID from auth/session
  const shopId = shopid;

  const t = useTranslations('admin.shop_products');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/shops/${shopId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data|| []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (data: any) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          images: data.images,
          description: data.description,
          sku: data.sku,
          price: parseFloat(data.price),
          stock: data.stock,
          published: data.published || false,
          categoryId: data.categoryId,
          platform_categoryId: data.platform_categoryId,
          attributes: Object.entries(data.attributes)
            .filter(([_, value]) => value)
            .map(([attributeId, value]) => ({
              attributeId,
              value,
            })),
        }),
      });

      if (response.ok) {
        await loadProducts();
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(t('manager.failed_to_create') + `: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      alert(t('manager.failed_to_create'));
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return;

    try {
      const response = await fetch(
        `/api/shops/${shopId}/products/${editingProduct.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            images: data.images,
            description: data.description,
            sku: data.sku,
            price: parseFloat(data.price),
            stock: data.stock,
            published: data.published || false,
            categoryId: data.categoryId,
            platform_categoryId: data.platform_categoryId,
            attributes: Object.entries(data.attributes)
              .filter(([_, value]) => value)
              .map(([attributeId, value]) => ({
                attributeId,
                value,
              })),
          }),
        }
      );

      if (response.ok) {
        await loadProducts();
        setEditingProduct(null);
        setInitialFormData(null);
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(`Failed to update product: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(
        `/api/shops/${shopId}/products/${productId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await loadProducts();
      } else {
        const error = await response.json();
        alert(`Failed to delete product: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

 /*  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  }; */
  const prepareProductEditData = async (product: Product) =>{
    const attributesMap: Record<string, string> = {};
    product.attributes?.forEach((attr) => {
      attributesMap[attr.attributeId] = attr.value;
    });

    const ancestors = await getCategoryAncestors(product.platform_categoryId);
    console.log(ancestors);
    const activity_id = ancestors[0]?.activityId;
    
    
    
    return {
      name: product.name,
      images: product.images,
      description: product.description,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock,
      published: product.published || false,
      activityId: activity_id||'', // Will be loaded based on category
      categoryId: product.categoryId,
      platform_categoryId: product.platform_categoryId,
      attributes: attributesMap,
    };


  }

  const handleEdit = async (product: Product) => {
    setPreparingEdit(true);
    try {
      // Use the utility function to prepare edit data with activityId
      const preparedData = await prepareProductEditData(product);
      
      setEditingProduct(product);
      setInitialFormData(preparedData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to prepare edit data:', error);
      alert('Failed to load product data. Please try again.');
    } finally {
      setPreparingEdit(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setInitialFormData(null);
  };

  const getInitialFormData =   (product: Product) => {
    const attributesMap: Record<string, string> = {};
    product.attributes?.forEach((attr) => {
      attributesMap[attr.attributeId] = attr.value;
    });
    
    
    
    return {
      name: product.name,
      images: product.images,
      description: product.description,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock,
      published: product.published || false,
      activityId: '', // Will be loaded based on category
      categoryId: product.categoryId,
      platform_categoryId: product.platform_categoryId,
      attributes: attributesMap,
    };
  };


  const togglePublished = async (product: Product) => {
      try {
        const response = await fetch(`/api/shops/${shopId}/products/${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: !product.published }),
        });
  
        if (response.ok) {
          await loadProducts();
        } else {
          alert('Failed to update product');
        }
      } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update product');
      }
    };
  

   

  const filteredProducts = products
    .filter((product) => {
      // name & category filter
      const name_cat = product.name+" "+product.platform_category?.name;
      if ( !name_cat.toLowerCase().includes(searchInput.toLowerCase())) {
        return false;
      }

      
      
      return true;
    })



  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('description')}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          {t('add_product')}
        </button>
      </div>

      {/* Loading Indicator for Edit Preparation */}
      {preparingEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700">Loading product data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4">{t('manager.loading')}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('manager.no_product_yet_title')}
          </h3>
          <p className="text-gray-500 mb-4">
            {t('manager.no_product_yet_description')}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('manager.form_modal.create_title')} 
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className=''>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'></label>
              <input type="text" onChange={(e) =>setSearchInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('manager.search_placeholder')}/> 
            </div>

          </div>
          {filteredProducts.map((product) => (
            <div key={product.id}  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"  >
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start justify-between">
                   {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-20 h-20 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {product.platform_category?.name}
                    </p>
                    
                    {product.description && (
                      <p className="text-gray-700 mb-4">{product.description.substring(0,255)}</p>
                    )}

                    {/* Attributes */}
                    {product.attributes?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.attributes.map((attr) => (
                          <span
                            key={attr.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            <span className="font-semibold mr-1">
                              {attr.attribute?.name}:
                            </span>
                            {attr.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex items-center gap-6 text-sm">
                      {product.sku && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">SKU:</span>
                          <span className="font-medium text-gray-900">
                            {product.sku}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">{t('manager.price_label')}</span>
                        <span className="font-medium text-gray-900">
                          {product.price.toFixed(2)} XOF
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">{t('manager.stock_label')}</span>
                        <span
                          className={`font-medium ${
                            product.stock > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </div>
                      {product.variations?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Variations:</span>
                          <span className="font-medium text-gray-900">
                            {product.variations.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                                          onClick={() => togglePublished(product)}
                                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            product.published
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}
                                        >
                                          {product.published ? (
                                            <>
                                              <Eye className="w-3 h-3" />
                                              {t('manager.published')}
                                            </>
                                          ) : (
                                            <>
                                              <EyeOff className="w-3 h-3" />
                                              {t('manager.draft')}
                                            </>
                                          )}
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Variations Section 
                {selectedProduct === product.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <ProductVariationsManager
                      productId={product.id}
                      shopId={shopId}
                      initialVariations={product.variations}
                    />
                  </div>
                )}*/}

                {/* Toggle Variations Button 
                <div className="mt-4">
                  <button
                    onClick={() =>
                      setSelectedProduct(
                        selectedProduct === product.id ? null : product.id
                      )
                    }
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedProduct === product.id
                      ? 'Hide Variations'
                      : 'Manage Variations'}
                  </button>
                </div>*/}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        shopId={shopId}
        initialData={initialFormData}
      />
    </div>
  );
}