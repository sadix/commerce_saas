// src/components/admin/PageEditorModal.tsx
'use client';

import { useState } from 'react';
import { Page } from '@prisma/client';
import { X } from 'lucide-react';
import { BlockEditor, Block } from './BlockEditor';
import {useTranslations} from 'next-intl';

interface PageEditorModalProps {
  shopId: string;
  page: Page;
  onClose: () => void;
}

export function PageEditorModal({ shopId, page, onClose }: PageEditorModalProps) {
  const t = useTranslations('admin.shop_pages.manager.editor_modal');
  const availableBlocks = [
    {
      type: 'Header',
      label: 'Header',
      defaultProps: {
        buttonText1:'About',
        buttonLink1:'/about',
        buttonText2:'Contact',
        buttonLink2:'/contact'
      },
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
        backgroundImage: 'data:image/png;base64,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wTm4BwfhIpyEm1bbvbynB5FAZHxto6zPUCoC1YD2khHLgz0SFYFAhAgCLSKAe3AQLsJJuAlH4Sqc1eLRnW3d6wQiu2sTGYVBZH7G0k4yWGco5qAgEASCwCYI4CKchJtwFK7CWbgLh23yWC9u9y6BaANlcm0h8GV57SLDaB97gXqEDAJBYJQI4ChchbNwFw7DZTgNt/UNlBUSSHeqytjaPlkb0DK6bK49ZITuJMlJQSAIBIFmEMBdOAyX4TTchuNwHc5r5pR2dyk6gcjO2jygAlTmBrZ2EODtQpPdg0AQCALtI4DLcBpuw3G4DufhPhzYvgTLn1BcAtHGycTaOuDJ0to9wGr/llc1TwaB4SAQTYaJAI7DdTgP9+FAXIgTcWNpWheRQGRcbZusCygZWTbW3gGxNNAiTxAIAkGgbQRwHw7EhTgRN+JIXIkz2z5/nv3XmkBkV20aUAAi8wJLOweweRTImiAQBILAkBHAhTgRN+JIXIkzcScOXafunScQbZhMqi2jvCyrXQOM9q0TMHJIEAgCQaAABG677bbKqy6KvyeTSTWZTKrXX3+9/lH1+OOPV2eccUZ18cUXVy+88EKFQ3EpTsWt+y0+4A+fX3nllfvtObs3mew9bzKZ7CfPhx9+WB1xxBFTWTxrfX3bThKIjKntkjUpKqPKptozCaQuUK6DQBAIAmNAQHJ4/vnn91PVvffee6/67rvvqtdee6264447qu+//366BplLIB988EHl9cwzz1S//PJLhUtxKm7FsbgW504f+vcfxH/ddddV77///r939r79+uuv1a5du6b77d69u/J67rnnph965q677qruu+++yjo3ne999mo1gciO2ixKUUiXQVntGIVnQuQ9CASB0SAQRfcggJyffvrp6rTTTtvz13//f+mllyqV/sknn1xdddVV1Zlnnjkldyveeeed6qyzzqrOPffc6pJLLpl+7h4uxam4FcfiWpyLe3GwxHPiiSfaovL59OLffyQql6eccoq3/V5ffPFF9dVXX1VXX311ZTokmbz11lsV2WcLG08gNpcJtVWE12FkRDWDO+9BIAgEgWo6irr88sunSWCGB+785ptvph3F7J53yWD2bnyFzP3t5TPPSTpe7kkSb7/99nRvSWDnzp3Vm2++WT311FM+3u8lgRxzzDHVUUcdtd99f/hsMplU9eTy9ddf7+tGrGkkgch42ibKSB4yomyYERWI8woCQSAI/IeAkZRK/tZbb/3vZu0Kd/pTopAwXM9es8/8Pbu27o033nBrmph0HEZNr7zySiVJXXPNNdOuRSL5888/q59//rnC2R7A2e/vGWtJIJPJZPr9Cvl85qUD8plrieTYY491ue+1UgLRYWiTCEEgmY9S2ilJZN8puWgMgWwUBIJAvxG49957K+MgY6qmNJFEHnrooeqBBx6oLr300ur222+fjrnsj4tx8jnnnFMdcsgh1V9//VXhbNz90UcfVVdcccW0q/D9hy7mlltu2W9MZY/NXgsnEO2SLiMjqs0gzf0gEASCwMYI6A588e37jY1XVFNy9xmuNdJyPXsh/o2u3fO9yM033zxNCBKIewe+JpNJdcIJJ1S+VvD1woMPPlg98sgj019zOe/OO++cfu9h9OXZ+sjKSEv34v7sNVcC0V1kRDWDLO9BIAiME4HVtfal96uvvjr9zmEymVR+heWl8rf7gSMr90x16u+uZ6/ZZ/72Cy5fwvvi2wjLva1eEoivGeyhS9EYePboo4+eJpmNRlb1kZa9t0wgGVGBKK8gEASCQDMI3HPPPdOfyhoXefkexMtPd42hdBBPPPHE9Ke77777bqUDMJJyul9DuaeL8XLtns98b+Envy+++GL18ssv7/suxGebvXQcEtfDDz9cGXH5CuLRRx+tzjvvvGlHcuihh05/fSXBWWtEdu21107vzfY8KIFYKBNlRDWDKO9BIAgEgW4QuP7666c/41X933DDDdVjjz1Wzb4rMaIympJQvFy7J3lcdtll0+c8757Pbrrppmki2kxyCcuX777Qn0wm067of//7X/Xss89WRlynnnpqdffdd1f333//9LO///57+t1Kfb9pAsmIqg5JrltCINsGgSBwAAL+oz2v+m1/6068JIT6Z/UOxrXPJBjflXjO314+c89n/vZy7V59T0nkvffe29cVuXbPeiOuG2+8cfofK0pSTz75ZKW58HWGnGHNDmOqTz/9dPrTrsMPP7w65phjqn/++af68ccfp/81pC9O8vouWHwXDBIH8YEx+oBcICfIDXKEL9LlDLnj/wAAAP//ANp13QAAAAZJREFUAwBk8p4Ku3HiDgAAAABJRU5ErkJggg==',
      },
    },
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
      type: 'ProductsList',
      label: 'Products List',
      defaultProps: {
        title: 'Our Products',
        subtitle: 'Browse our collection',
        layout: 'grid',
        columns: 3,
        showFilters: true,
        shopId: shopId,
      },
    },
    {
      type: 'ProductsCollectionList',
      label: 'Product Collection List',
      defaultProps: {
        title: 'Collection',
        subtitle: 'Browse our collection',
        layout: 'grid',
        columns: 3,
        showFilters: true,
        collectionId : "all",
        shopId: shopId,
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
    {
      type: 'Footer',
      label: 'Footer',
      defaultProps: {},
    },
  ];

  const handleSave = async (blocks: Block[]) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout: blocks,
        }),
      });

      if (response.ok) {
        alert('Page saved successfully!');
        onClose();
        window.location.reload();
      } else {
        alert('Failed to save page');
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{t('edit_page_label')} {page.title}</h2>
            <p className="text-sm text-gray-600">/{page.slug}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6 overflow-y-auto">
          <BlockEditor
            initialBlocks={isValidBlockArray(page.layout) ? page.layout as Block[] : []}
            onSave={handleSave}
            availableBlocks={availableBlocks}
            shopId={shopId}
          />
        </div>
      </div>
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