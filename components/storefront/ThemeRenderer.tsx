'use client';

import { useEffect, useState } from 'react';
import { Block } from '@/components/admin/BlockEditor';
import { ThemeComponent } from '@/types/theme';
import { useThemeSettings } from '@/theme-settings';
import { getGoogleFontUrl } from '@/lib/fonts'

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
  
  //GET fonts from typography
  const displayFontUrl = getGoogleFontUrl(typography.fontDisplay.split(' ')[0].replaceAll("'", "").replaceAll(",", ""));
  const bodyFontUrl = getGoogleFontUrl(typography.fontBody.split(' ')[0].replaceAll("'", "").replaceAll(",", ""));
  
  

  return (
    <div className="min-h-screen" style={{ color: colors.text , backgroundColor: colors.background, fontFamily: typography.fontBody }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://gstatic.com"  />
      <link rel="stylesheet" href={displayFontUrl} />
      <link rel="stylesheet" href={bodyFontUrl} />
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