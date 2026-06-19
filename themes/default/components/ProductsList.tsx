// src/themes/default/components/ProductsList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import {useTranslations, useLocale} from 'next-intl';

import { ProductDetailModal } from './ProductDetailModal'; 


interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  stock: number;
  hasVariations: boolean;
  published: boolean;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  };
  platform_category: {
    id: string;
    name: string;
    translations: Translation[];
  }; 
  platform_categoryId: string;
}

interface Category {
  id: string;
  name: string;
  productCount: number;
  translations: Translation[];
  
}

interface PlatformCategory {
  id: string;
  name: string;
  parentId: string | null;
  children?: PlatformCategory[];
  productCount?: number;
  translations: Translation[];
}

interface ProductsListProps {
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'list';
  columns?: 2 | 3 | 4;
  showFilters?: boolean;
  shopId?: string;
  
}

interface Translation {
  locale: string;
  name: string;
}


export default function ProductsList({
  title = 'Our Products',
  subtitle = 'Browse our collection',
  layout = 'grid',
  columns = 3,
  showFilters = true,
  shopId,
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platformCategories, setPlatformCategories] = useState<PlatformCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { addItem } = useCart();
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedPlatformCategory, setSelectedPlatformCategory] = useState<string>('all');
  const [expandedPlatformCategories, setExpandedPlatformCategories] = useState<Set<string>>(new Set());
  
  const [initialPriceRange, setInitialPriceRange] = useState<[number, number]>([0, 1000]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState<string>('name-asc');


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

  const locale = useLocale();
  console.log("Current locale:", locale);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortBy, itemsPerPage]);

  useEffect(() => {
    if (shopId) {
      fetchProducts();
      //fetchCategories();
      fetchPlatformCategories();
 
    }
  }, [shopId]);

  useEffect(()  => {
        //set Max price for price filter based on max product price
        //fetch max price from products and set it as max value for price range filter  
        //const maxPrice = products.reduce((max, product) => product.price > max ? product.price : max, 0);
        const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 10000;
        setInitialPriceRange([0, maxPrice]);
        setPriceRange([0, maxPrice]);
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/products`);
      if (response.ok) {
        const data = await response.json();
        // Only show published products
        setProducts(data.filter((p: Product) => p.published ));
      }
    } catch (error) { 
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          productCount: cat._count.products,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPlatformCategoriesbyActivity= async (activityId:string) => {
    
    try {
      //const response = await fetch(`/api/activities/${activityId}/categories`);
      const response = await fetch(`/api/activities/${activityId}/categories`);
      if (response.ok) {
        const data = await response.json();
        // Build hierarchical structure
        //const hierarchy = buildCategoryHierarchy(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch platform categories:', error);
    }

  }

  const fetchPlatformCategories = async () => {
     try {
      //const response = await fetch(`/api/activities/${activityId}/categories`);
      const response = await fetch(`/api/platformcategories?shopid=${shopId}`);
  
      if (response.ok) {
        const data = await response.json();
        // Build hierarchical structure
        const hierarchy = buildCategoryHierarchy(data);
        setPlatformCategories(hierarchy);
      }
    } catch (error) {
      console.error('Failed to fetch platform categories:', error);
    } 

      /* try{
        const response = await fetch(`/api/activities/`);
        if( response.ok){
          const data = await response.json();
          const alldata= await data.map(  (activity:any) => {
            return  fetchPlatformCategoriesbyActivity(activity.id);
          });
          console.log(alldata);
          const allhierarchy = buildCategoryHierarchy(alldata.flat());
          setPlatformCategories(allhierarchy);
        }

      }catch (error) {
      console.error('Failed to fetch platform categories:', error);
      }  */
  };

  

  // Build hierarchical category structure
  const buildCategoryHierarchy = (categories: any[]): PlatformCategory[] => {
    const categoryMap = new Map<string, PlatformCategory>();
    const rootCategories: PlatformCategory[] = [];

    // First pass: create all category objects
    categories.forEach((cat: any) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        parentId: cat.parentId,
        children: [],
        productCount: cat._count?.products || 0,
        translations: cat.translations || [],
      });
    });

    // Second pass: build hierarchy
    categoryMap.forEach((category) => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        } else {
          // Parent not found, treat as root
          rootCategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  };

  // Get all descendant category IDs (for filtering)
  const getDescendantIds = (categoryId: string): string[] => {
    const ids: string[] = [categoryId];
    
    const findDescendants = (categories: PlatformCategory[]) => {
      for (const cat of categories) {
        if (cat.id === categoryId && cat.children) {
          const addChildren = (children: PlatformCategory[]) => {
            children.forEach(child => {
              ids.push(child.id);
              if (child.children && child.children.length > 0) {
                addChildren(child.children);
              }
            });
          };
          addChildren(cat.children);
          return;
        }
        if (cat.children && cat.children.length > 0) {
          findDescendants(cat.children);
        }
      }
    };

    findDescendants(platformCategories);
    return ids;
  };


  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
        return false;
      }

      // Platform Category filter (with hierarchical support)
      if (selectedPlatformCategory !== 'all') {
        const allowedCategoryIds = getDescendantIds(selectedPlatformCategory);
        //console.log(allowedCategoryIds);
        if (!product.platform_categoryId || !allowedCategoryIds.includes(product.platform_categoryId)) {
          return false;
        }
      }
      
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const FilterSection = () => {

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
      const newExpanded = new Set(expandedPlatformCategories);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      setExpandedPlatformCategories(newExpanded);
    };

    // Render platform categories recursively
    const renderPlatformCategory = (category: PlatformCategory, level: number = 0) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedPlatformCategories.has(category.id);
      const isSelected = selectedPlatformCategory === category.id;

      return (
        
        <div key={category.id}>
          <label 
            className={`flex items-center gap-2 cursor-pointer py-1.5 hover:bg-gray-50 rounded px-2 ${
              isSelected ? 'bg-blue-50' : ''
            }`}
            style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          >
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleCategory(category.id);
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                <ChevronRight 
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            )}
            {!hasChildren && <span className="w-4" />}
            <input
              type="radio"
              name="platformCategory"
              value={category.id}
              checked={isSelected}
              onChange={(e) => setSelectedPlatformCategory(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 flex-1">{(locale === "en") ? category.name : category.translations.find(t => t.locale === locale)?.name || 'untranslated'}</span>
            {category.productCount !== undefined && category.productCount > 0 && (
              <span className="text-xs text-gray-500">({category.productCount})</span>
            )}
          </label>
          {hasChildren && isExpanded && (
            <div>
              {category.children!.map(child => renderPlatformCategory(child, level + 1))}
            </div>
          )}
        </div>
      );
    };


    return(
    <div className="space-y-6">
        {/* Platform Categories (Hierarchical) */}
        { platformCategories.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer py-1.5 hover:bg-gray-50 rounded px-2">
                <span className="w-4" />
                <input
                  type="radio"
                  name="platformCategory"
                  value="all"
                  checked={selectedPlatformCategory === 'all'}
                  onChange={(e) => setSelectedPlatformCategory(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex-1">All Categories</span>
                <span className="text-xs text-gray-500">({products.length})</span>
              </label>
              {platformCategories.map(category => renderPlatformCategory(category))}
            </div>
          </div>
        )}

        {/* Shop Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Shop Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="all"
                  checked={selectedCategory === 'all'}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">All Products</span>
                <span className="text-xs text-gray-500 ml-auto">({products.length})</span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{(locale == "en") ? category.name : category.translations.find(t => t.locale === locale)?.name || category.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">({category.productCount})</span>
                </label>
              ))}
            </div>
          </div>
        )}

      {/* Price Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Min"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || initialPriceRange[1] ])}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Max"
            />
          </div>
          <input
            type="range"
            min="0"
            max={initialPriceRange[1]}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>XOF{priceRange[0]}</span>
            <span>XOF{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => {
          setSelectedCategory('all');
          const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 10000;
          setPriceRange([0, maxPrice]);
          setSelectedPlatformCategory('all');
        }}
        className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
      >
        Reset Filters
      </button>
    </div>
    );
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
        {/* Results Info */}
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Items Per Page */}
        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm text-gray-600">
            Per page:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-gray-500">Loading products...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        {/* Filters and Products */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          {showFilters && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <FilterSection />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-sm text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                {showFilters && (
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                )}

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name-asc">Name: A-Z</option>
                  <option value="name-desc">Name: Z-A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid/List */}
            {paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No products found matching your filters.</p>
              </div>
            ) : layout === 'grid' ? (
              <div className={`grid ${gridCols[columns]} gap-6`}>
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-200 overflow-hidden" onClick={() => setSelectedProduct(product)}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {product.category && (
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          {product.category.name}
                        </p>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                          XOF {product.price.toFixed(2)}
                        </span>
                        {product.stock > 0 ? (
                          <button 
                            onClick={() => addItem(product)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex"
                  >
                    {/* Product Image */}
                    <div className="w-48 h-48 bg-gray-200 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]}  alt={product.name}  className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        {product.category && (
                          <p className="text-sm text-blue-600 font-medium mb-1">
                            {product.category.name}
                          </p>
                        )}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-gray-600 mb-4">{product.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          XOF{product.price.toFixed(2)}
                        </span>
                        {product.stock > 0 ? (
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Add to Cart
                          </button>
                        ) : (
                          <span className="text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination />
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(100vh-140px)]">
              <FilterSection />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && shopId && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          shopId={shopId}
        />
      )}

    </section>
  );
}