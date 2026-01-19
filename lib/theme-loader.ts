import { ThemeComponent } from '@/types/theme';

// Registry of all available themes
const themeRegistry: Record<string, () => Promise<Record<string, ThemeComponent>>> = {
  default: () => import('@/themes/default'),
  modern: () => import('@/themes/modern'),
  'bike-shop': () => import('@/themes/bike-shop'),
  'food-shop': () => import('@/themes/food-shop'),
  'electronics': () => import('@/themes/electronics'),
  'pet-shop': () => import('@/themes/pet-shop'),
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