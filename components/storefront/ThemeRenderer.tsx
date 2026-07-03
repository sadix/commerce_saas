'use client';

import { useEffect, useState } from 'react';
import { Block } from '@/components/admin/BlockEditor';
import { ThemeComponent } from '@/types/theme';
import { useThemeSettings } from '@/theme-settings';

interface ThemeRendererProps {
  blocks: Block[];
  themeSlug: string;
  shopData: {
    name: string;
    logoUrl?: string;
    subdomain?: string;
  };
  pages?: Array<{
    title: string;
    slug: string;
    showInNav?: boolean;
  }>;
}

export function ThemeRenderer({ blocks, themeSlug, shopData, pages  }: ThemeRendererProps) {
  const [themeComponents, setThemeComponents] = useState<Record<string, ThemeComponent> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadThemeComponents() {
      try {
        //const themModule = await import(`@/themes/${themeSlug}`);
        const themModule = await import(`@/themes/default`);
        setThemeComponents(themModule.default || themModule);
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setLoading(false);
      }
    }

    loadThemeComponents();
  }, [themeSlug]);

  const { colors, shape, components, typography} = useThemeSettings();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" >
        <div className="text-gray-500">Loading theme...</div>
      </div>
    );
  }

  if (!themeComponents) {
    return (
      <div className="min-h-screen flex items-center justify-center" >
        <div className="text-red-500">Failed to load theme</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ color: colors.text , backgroundColor: colors.background, fontFamily: typography.fontBody }}>
      {blocks.map((block) => {
        const Component = themeComponents[block.type]?.component;

        if (!Component) {
          console.warn(`Component "${block.type}" not found in theme`);
          return null;
        }

        // Pass pages to Header component
        const props = block.type === 'Header' || block.type === 'HeaderLogoTop'
          ? { ...block.props, shopData, pages }
          : { ...block.props, shopData };

        return (
          
          <Component key={block.id} {...props} />
        );
      })}
    </div>
  );
}