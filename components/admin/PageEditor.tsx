'use client';

import { useState } from 'react';
import { BlockEditor, Block } from './BlockEditor';
import { Page } from '@prisma/client';
import { string } from 'zod';

interface PageEditorProps {
  shopId: string;
  pages: Page[];
}



export function PageEditor({ shopId, pages }: PageEditorProps) {
  const [selectedPage, setSelectedPage] = useState<Page | null>(pages[0] || null);

  const availableBlocks = [
    {
      type: 'Header',
      label: 'Header',
      defaultProps: {},
    },
    {
      type: 'HeaderLogoTop',
      label: 'Header with Logo on top',
      defaultProps: {},
    },
    {
      type: 'Hero',
      label: 'Hero Section',
      defaultProps: {
        title: 'Hero Title',
        subtitle: 'Hero subtitle',
        buttonText: 'Learn More',
        buttonLink: '#',
      },
    },
    { type: 'FeaturedProducts', label: 'Featured Products', defaultProps: {
    title: 'Featured Products',
    limit: 8,
    shopId: shopId
  }},
  { type: 'CategoryShowcase', label: 'Category Showcase', defaultProps: {
    title: 'Shop by Category',
    layout: 'grid',
    shopId: shopId
  }},
  { type: 'ProductCarousel', label: 'Product Carousel', defaultProps: {
    title: 'Best Sellers',
    shopId: shopId
  }},
  { type: 'ProductsList', label: 'Products List', defaultProps: {} },
  { type: 'Newsletter', label: 'Newsletter', defaultProps: {} },
    {
      type: 'Features',
      label: 'Features',
      defaultProps: {
        title: 'Our Features',
        features: [
          { title: 'Feature 1', description: 'Description 1' },
          { title: 'Feature 2', description: 'Description 2' },
          { title: 'Feature 3', description: 'Description 3' },
        ],
      },
    },
    {
      type: 'Footer',
      label: 'Footer',
      defaultProps: {},
    },
  ];

  const handleSave = async (blocks: Block[]) => {
    if (!selectedPage) return;

    try {
      const response = await fetch(`/api/shops/${shopId}/pages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPage.id,
          layout: blocks,
        }),
      });

      if (response.ok) {
        alert('Page saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    }
  };

  if (!selectedPage) {
    return <div>No pages found. Create a page first.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Page</label>
        <select
          value={selectedPage.id}
          onChange={(e) => {
            const page = pages.find((p) => p.id === e.target.value);
            if (page) setSelectedPage(page);
          }}
          className="px-4 py-2 border rounded"
        >
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.title}
            </option>
          ))}
        </select>
      </div>

      <BlockEditor
        initialBlocks={isValidBlockArray(selectedPage.layout) ? selectedPage.layout as Block[] : []}
        onSave={handleSave}
        availableBlocks={availableBlocks}
        shopId={shopId}
      />
    </div>
  );
}

// A function to check if a single item is a Block
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isBlock(item: any): item is Block {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item && typeof item.id === 'string' &&
    'type' in item && typeof item.type === 'string' &&
    'props' in item && typeof item.props === 'object'
  );
}

// A function to validate the entire array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidBlockArray(data: any): data is Block[] {
  return Array.isArray(data) && data.every(isBlock);
}