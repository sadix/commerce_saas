// src/components/admin/PageFormModal.tsx
'use client';

import { useState } from 'react';
import { Page } from '@prisma/client';
import { X, Plus, Settings } from 'lucide-react';

interface PageFormModalProps {
  shopId: string;
  page?: Page;
  trigger: 'button' | 'icon';
}

export function PageFormModal({ shopId, page, trigger }: PageFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    published: page?.published ?? true,
    isHome: page?.isHome || false,
    showInNav: page ? (page as any).showInNav ?? true : true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from title
    if (name === 'title' && !page) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData({
        ...formData,
        title: value,
        slug,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
      const url = page
        ? `/api/shops/${shopId}/pages/${page.id}`
        : `/api/shops/${shopId}/pages`;
      
      const method = page ? 'PATCH' : 'POST';

      const body: any = {
        title: formData.title,
        slug: formData.slug,
        published: formData.published,
        showInNav: formData.showInNav,
      };

      // Only include layout if creating new page
      if (!page) {
        body.layout = [
          {
            id: 'header-1',
            type: 'Header',
            props: {},
          },
          {
            id: 'hero-1',
            type: 'Hero',
            props: {
              title: formData.title,
              subtitle: 'Welcome to this page',
            },
          },
          {
            id: 'footer-1',
            type: 'Footer',
            props: {},
          },
        ];
        body.isHome = formData.isHome;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsOpen(false);
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save page');
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
          Add Page
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {page ? 'Page Settings' : 'Add New Page'}
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., About Us, Contact"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 text-sm">
                    /
                  </span>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    pattern="[a-z0-9-]+"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="about-us"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Only lowercase letters, numbers, and hyphens. This will be the page URL.
                </p>
              </div>

              {!page && (
                <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <input
                    id="isHome"
                    name="isHome"
                    type="checkbox"
                    checked={formData.isHome}
                    onChange={handleCheckbox}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isHome" className="ml-2 block text-sm text-gray-900">
                    Set as home page
                  </label>
                </div>
              )}

              <div className="space-y-3 p-4 bg-gray-50 rounded-md">
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
                    Published (visible on your store)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="showInNav"
                    name="showInNav"
                    type="checkbox"
                    checked={formData.showInNav}
                    onChange={handleCheckbox}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showInNav" className="ml-2 block text-sm text-gray-900">
                    Show in navigation menu
                  </label>
                </div>
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
                  {loading ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}