import { ThemeComponent } from '@/types/theme';

// Registry of all available themes
const themeRegistry: Record<string, () => Promise<Record<string, ThemeComponent>>> = {
  //@ts-ignore
  'default': () => import('@/themes/default'),
  //@ts-ignore
  'modern': () => import('@/themes/modern'),
  //@ts-ignore
  'bike-shop': () => import('@/themes/bike-shop'),
  //@ts-ignore
  'food-shop': () => import('@/themes/food-shop'),
  //@ts-ignore
  'electronics': () => import('@/themes/electronics'),
  //@ts-ignore
  'pet-shop': () => import('@/themes/pet-shop'),
  //@ts-ignore
  'home-goods': () => import('@/themes/home-goods'),
};

export async function loadTheme(themeSlug: string): Promise<Record<string, ThemeComponent>> {
  const loader = themeRegistry[themeSlug];
  if (!loader) {
    throw new Error(`Theme "${themeSlug}" not found`);
  }
  return await loader();
}

export function getAvailableThemes(): string[] {
  return Object.keys(themeRegistry);
}