// src/components/admin/ProductFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, Loader2 } from 'lucide-react';
import { CategoryPath, getCategoryAncestors} from '@/lib/categoryHelpers';

interface Activity {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  activityId: string | null;
  children?: Category[];
  parent?: Category;
}

interface Attribute {
  id: string;
  name: string;
  handle: string;
  type: string;
  required: boolean;
  options: AttributeOption[];
}

interface AttributeOption {
  id: string;
  value: string;
}

interface ProductFormData {
  name: string;
  images: string[];
  description: string;
  sku: string;
  price: string;
  stock: number;
  published: boolean;
  activityId: string;
  categoryId: string;
  platform_categoryId:string;
  attributes: Record<string, string>;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  shopId: string;
  initialData?: Partial<ProductFormData>;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  shopId,
  initialData,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    images:[],
    description: '',
    sku: '',
    price: '',
    stock: 0,
    published: false,
    activityId: '',
    categoryId: '',
    platform_categoryId:'',
    attributes: {},
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);

  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]); // Placeholder for categories, replace with actual data fetching if needed
  
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Load activities on mount and handle initial data for editing
  useEffect(() => {
    const initializeForm = async () => {
      if (!isOpen) return;

      setInitializing(true);
      try {
        // Load activities first
        await loadActivities();
        await loadCollections();

        // If editing a product, load its category hierarchy
        if (initialData && initialData.platform_categoryId) {
          await loadCategoryHierarchyForEdit(initialData);
        } else if (initialData && !initialData.platform_categoryId ) {
          // Just set the initial data without category hierarchy
          setFormData((prev) => ({ ...prev, ...initialData }));
        }
      } catch (error) {
        console.error('Failed to initialize form:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeForm();
  }, [isOpen]);
  // Load categories when activity changes (but not on initial load when editing)
  useEffect(() => {
    if (formData.activityId && !initializing && !initialData?.activityId) {
      loadCategories(formData.activityId, false);
    }
  }, [formData.activityId]);

  // Load attributes when category changes
  useEffect(() => {
    if (formData.platform_categoryId) {
      loadCategoryAttributes(formData.platform_categoryId);
    } else {
      setAvailableAttributes([]);
    }
  }, [formData.platform_categoryId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/shops/${shopId}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };



  const loadCategoryHierarchyForEdit = async (data: Partial<ProductFormData>) => {
    if (!data.platform_categoryId) return;

    try {
      // Get category ancestors to build the path
      const categoryIdTrimmed = data.platform_categoryId.split('shopify/TaxonomyCategory/')[1];
      const response = await fetch(`/api/activities/${data.activityId}/categories/${categoryIdTrimmed}/path`);
      
      if (response.ok) {
        const pathData = await response.json();
        
        if (pathData.length > 0) {
          // First item should have the activityId
          const activityId = pathData[0].activityId || '';  
          
          // Load categories for this activity
          await loadCategories(activityId, true);
          
          // Build category path (all items except the last one which is the selected category)
          const path: Category[] = [];
          for (let i = 0; i < pathData.length - 1; i++) {
            path.push({
              id: pathData[i].id,
              name: pathData[i].name,
              slug: pathData[i].slug,
              parentId: pathData[i].parentId || null,
              activityId: pathData[i].activityId || null,
            });
          }
          
          setCategoryPath(path);
          
          // Set form data with all initial values
          setFormData((prev) => ({
            ...prev,
            ...data,
            activityId: activityId,
          }));
        }
      } else {
        // If path API fails, just set the data
        setFormData((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load category hierarchy:', error);
      setFormData((prev) => ({ ...prev, ...data }));
    }
  };
  

  const loadCategories = async (activityId: string, preserveSelection: boolean = false) => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`/api/activities/${activityId}/categories?depth=6`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        
        // Only clear category selection if not preserving (i.e., not editing)
        if (!preserveSelection) {
          setCategoryPath([]);
          setFormData((prev) => ({ ...prev, platform_categoryId: '' }));
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadCategoryAttributes = async (categoryId: string) => {
    setLoadingAttributes(true);
    const categoryIdtrimmed = categoryId.split('shopify/TaxonomyCategory/')[1];
    try {
      const response = await fetch(`/api/activities/${formData.activityId}/categories/${categoryIdtrimmed}/attributes`);
      if (response.ok) {
        const data = await response.json();
        setAvailableAttributes(data);
        
        // Initialize attributes with empty values
        const initialAttributes: Record<string, string> = {};
        data.forEach((attr: Attribute) => {
          if (formData.attributes[attr.id]) {
            initialAttributes[attr.id] = formData.attributes[attr.id];
          } else {
            initialAttributes[attr.id] = '';
          }
        });
        setFormData((prev) => ({ ...prev, attributes: initialAttributes }));
      }
    } catch (error) {
      console.error('Failed to load attributes:', error);
    } finally {
      setLoadingAttributes(false);
    }
  };

  const buildCategoryTree = (categories: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    // Create a map of all categories
    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Build the tree
    categories.forEach((cat) => {
      const category = map.get(cat.id)!;
      if (cat.parentId) {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        roots.push(category);
      }
    });
    //console.log(roots);
    return roots;
  };

  const getCurrentLevelCategories = (): Category[] => {
    if (categoryPath.length === 0) {
      const tree = buildCategoryTree(categories);
      return tree;
    }

    const currentParent = categoryPath[categoryPath.length - 1];
    return currentParent.children || [];
  };

  const handleCategorySelect = (category: Category) => {
    if (category.children && category.children.length > 0) {
      // Has children, navigate deeper
      
      setCategoryPath([...categoryPath, category]);
      setFormData((prev) => ({ ...prev, platform_categoryId: category.id }));
    } else {
      // Leaf category, select it
      setFormData((prev) => ({ ...prev, platform_categoryId: category.id }));
    }
  };

  const handleCategoryBack = () => {
    if (categoryPath.length > 0) {
      setCategoryPath(categoryPath.slice(0, -1));
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCategoryPath(categoryPath.slice(0, index));
  };

  const handleAttributeChange = (attributeId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required attributes
    const missingRequired = availableAttributes
      .filter((attr) => attr.required && !formData.attributes[attr.id])
      .map((attr) => attr.name);

    if (missingRequired.length > 0) {
      alert(`Please fill in required attributes: ${missingRequired.join(', ')}`);
      return;
    }

    setSubmitting(true);
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

      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      images: [],
      description: '',
      sku: '',
      price: '',
      stock: 0,
      published: false,
      activityId: '',
      categoryId: '',
      platform_categoryId: '',
      attributes: {},
    });
    setCategoryPath([]);
    setCategories([]);
    setAvailableAttributes([]);
    onClose();
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  if (!isOpen) return null;

  const selectedActivity = activities.find((a) => a.id === formData.activityId);
  const selectedCategory = categories.find((c) => c.id === formData.platform_categoryId);
  const currentLevelCategories = getCurrentLevelCategories();
  
  

 return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading Indicator for Initialization */}
        {initializing && (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-gray-500 mt-2">Loading product data...</p>
          </div>
        )}

        {/* Form */}
        {!initializing && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
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

                    {formData.images &&  (
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
                    Collection
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
                    <option value="">Select a collection</option>
                    {collections.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                    ))}
                </select>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SKU-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Category</h3>

                {/* Activity Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.activityId}
                    onChange={(e) => {
                      setFormData({ ...formData, activityId: e.target.value, platform_categoryId: '' });
                      setCategoryPath([]);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Select an activity...</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hierarchical Category Selection */}
                {formData.activityId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Breadcrumb Navigation */}
                    {categoryPath.length > 0 && (
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-xs font-medium text-gray-500 mr-1">
                          Level {categoryPath.length}:
                        </span>
                        <button
                          type="button"
                          onClick={() => setCategoryPath([])}
                          className="hover:text-blue-600 font-medium"
                        >
                          {selectedActivity?.name}
                        </button>
                        {categoryPath.map((cat, index) => (
                          <div key={cat.id} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <button
                              type="button"
                              onClick={() => handleBreadcrumbClick(index + 1)}
                              className={`hover:text-blue-600 ${
                                index === categoryPath.length - 1 ? 'font-semibold text-gray-900' : 'font-medium'
                              }`}
                            >
                              {cat.name}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Category Display */}
                    {(formData.platform_categoryId && selectedCategory) && (
                      <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Selected Category:</p>
                            <p className="text-blue-700">{selectedCategory.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, platform_categoryId: '' })}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Category List */}
                    {!formData.platform_categoryId && (
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        {loadingCategories ? (
                          <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                            <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
                          </div>
                        ) : currentLevelCategories.length > 0 ? (
                          <>
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                              <p className="text-xs font-medium text-gray-600">
                                {categoryPath.length === 0 
                                  ? 'Select a top-level category' 
                                  : categoryPath.length >= 5 
                                    ? 'Select final category (Level 6)' 
                                    : `Navigate to subcategory or select (Level ${categoryPath.length + 1})`}
                              </p>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                              {currentLevelCategories.map((category) => {
                                const hasChildren = category.children && category.children.length > 0;
                                return (
                                  <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleCategorySelect(category)}
                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-200 last:border-b-0 flex items-center justify-between group transition-colors"
                                  >
                                    <div className="flex-1">
                                      <span className="text-gray-900 font-medium">{category.name}</span>
                                      {!hasChildren && (
                                        <span className="ml-2 text-xs text-green-600 font-medium">
                                          • Leaf Category
                                        </span>
                                      )}
                                    </div>
                                    {hasChildren ? (
                                      <div className="flex items-center gap-2 text-blue-600">
                                        <span className="text-xs font-medium">
                                          {category.children?.length} subcategories
                                        </span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                        Select
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <p className="font-medium">No categories available</p>
                            <p className="text-sm mt-1">This level has no subcategories</p>
                          </div>
                        )}
                        
                        {categoryPath.length > 0 && !loadingCategories && (
                          <button
                            type="button"
                            onClick={handleCategoryBack}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-medium border-t border-gray-200 flex items-center justify-center gap-2"
                          >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Back to Level {categoryPath.length}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Attributes */}
              {formData.platform_categoryId && availableAttributes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
                  
                  {loadingAttributes ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Loading attributes...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {availableAttributes.map((attribute) => (
                        <div key={attribute.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {attribute.name}
                            {attribute.required && <span className="text-red-500"> *</span>}
                          </label>
                          
                          {attribute.type === 'select' && attribute.options.length > 0 ? (
                            <select
                              required={attribute.required}
                              value={formData.attributes[attribute.id] || ''}
                              onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select {attribute.name}...</option>
                              {attribute.options.map((option) => (
                                <option key={option.id} value={option.value}>
                                  {option.value}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              required={attribute.required}
                              value={formData.attributes[attribute.id] || ''}
                              onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Enter ${attribute.name.toLowerCase()}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.platform_categoryId}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}