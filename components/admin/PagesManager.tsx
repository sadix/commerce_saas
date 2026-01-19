// src/components/admin/PagesManager.tsx
'use client';

import { useState } from 'react';
import { Page } from '@prisma/client';
import { PageFormModal } from './PageFormModal';
import { PageEditorModal } from './PageEditorModal';
import { FileText, Edit, Trash2, Home, Eye, EyeOff } from 'lucide-react';

interface PagesManagerProps {
  shopId: string;
  pages: Page[];
}

export function PagesManager({ shopId, pages }: PagesManagerProps) {
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const response = await fetch(`/api/shops/${shopId}/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete page');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete page');
    }
  };

  const togglePublished = async (page: Page) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !page.published }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update page');
    }
  };

  if (pages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No pages yet</h3>
        <p className="text-gray-600 mb-6">Create your first page to get started</p>
        <PageFormModal shopId={shopId} trigger="button" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <PageFormModal shopId={shopId} trigger="button" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                    {page.isHome && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Home className="w-3 h-3" />
                        Home
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">/{page.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => togglePublished(page)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    page.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {page.published ? (
                    <>
                      <Eye className="w-3 h-3" />
                      Published
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      Draft
                    </>
                  )}
                </button>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => setSelectedPage(page)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit Content
                </button>
                <PageFormModal shopId={shopId} page={page} trigger="icon" />
                {!page.isHome && (
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPage && (
        <PageEditorModal
          shopId={shopId}
          page={selectedPage}
          onClose={() => setSelectedPage(null)}
        />
      )}
    </div>
  );
}