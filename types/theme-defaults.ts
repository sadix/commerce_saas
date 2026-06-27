// src/types/theme-defaults.ts
// Each theme ships its own token overrides on top of DEFAULT_THEME_SETTINGS.
// Only include what's different — everything else inherits the base.

import type { ThemeOverrides } from './theme-settings';

// ─── Default theme ────────────────────────────────────────────────────────────
export const defaultThemeDefaults: ThemeOverrides = {
  // inherits everything from DEFAULT_THEME_SETTINGS unchanged
};

// ─── Fashion ─────────────────────────────────────────────────────────────────
export const fashionThemeDefaults: ThemeOverrides = {
  colors: {
    primary:            '#0A0A0A',
    secondary:          '#C9A896',
    accent:             '#C9A896',
    background:         '#FAFAF8',
    surface:            '#FAFAF8',
    text:               '#0A0A0A',
    textMuted:          '#6B6B69',
    border:             '#0A0A0A',
    primaryForeground:  '#FAFAF8',
  },
  typography: {
    fontDisplay:           "'Playfair Display', Georgia, serif",
    fontBody:              "'Inter', system-ui, sans-serif",
    fontWeightDisplay:     500,
    letterSpacingDisplay:  '0.05em',
  },
  shape: {
    radiusSmall:   '0',
    radiusMedium:  '0',
    radiusLarge:   '0',
    radiusFull:    '0',
  },
  components: {
    buttonStyle:  'outline',
    heroLayout:   'split',
    announcementText: 'New Season — Free Returns Within 30 Days',
  },
};

// ─── Beauty ───────────────────────────────────────────────────────────────────
export const beautyThemeDefaults: ThemeOverrides = {
  colors: {
    primary:            '#E8A0A0',
    secondary:          '#F4C9A8',
    accent:             '#D4587A',
    background:         '#FFF5F3',
    surface:            '#FFFFFF',
    text:               '#2D2424',
    textMuted:          '#8C6B6B',
    border:             '#F0D8D0',
    primaryForeground:  '#2D2424',
  },
  typography: {
    fontDisplay:           "'Cormorant Garamond', Georgia, serif",
    fontBody:              "'Poppins', system-ui, sans-serif",
    fontWeightDisplay:     500,
    letterSpacingDisplay:  '0',
  },
  shape: {
    radiusSmall:   '0.5rem',
    radiusMedium:  '1rem',
    radiusLarge:   '2rem',
    radiusFull:    '9999px',
  },
  components: {
    buttonStyle:  'filled',
    heroLayout:   'centered',
    announcementText: '✨ Free samples on every order',
  },
};

// ─── Furniture ────────────────────────────────────────────────────────────────
export const furnitureThemeDefaults: ThemeOverrides = {
  colors: {
    primary:            '#2B2420',
    secondary:          '#B08968',
    accent:             '#7C9070',
    background:         '#F5F0E8',
    surface:            '#EDE8DC',
    text:               '#2B2420',
    textMuted:          '#7A6E65',
    border:             '#D9D1C3',
    primaryForeground:  '#F5F0E8',
  },
  typography: {
    fontDisplay:           "'Fraunces', Georgia, serif",
    fontBody:              "'Karla', system-ui, sans-serif",
    fontWeightDisplay:     500,
    letterSpacingDisplay:  '-0.01em',
  },
  shape: {
    radiusSmall:   '0.125rem',
    radiusMedium:  '0.25rem',
    radiusLarge:   '0.5rem',
    radiusFull:    '0.5rem',
  },
  components: {
    buttonStyle:  'filled',
    heroLayout:   'split',
    announcementText: 'Handmade in small batches — free delivery over $500',
  },
};

// ─── Food / Grocery ───────────────────────────────────────────────────────────
export const foodGroceryThemeDefaults: ThemeOverrides = {
  colors: {
    primary:            '#1F4D2C',
    secondary:          '#F2A03D',
    accent:             '#E85D4C',
    background:         '#FFFBF2',
    surface:            '#FFFFFF',
    text:               '#1A2E1E',
    textMuted:          '#4A6354',
    border:             '#D4E6DA',
    primaryForeground:  '#FFFBF2',
  },
  typography: {
    fontDisplay:           "'Bricolage Grotesque', system-ui, sans-serif",
    fontBody:              "'Inter', system-ui, sans-serif",
    fontWeightDisplay:     800,
    letterSpacingDisplay:  '-0.03em',
  },
  shape: {
    radiusSmall:   '0.5rem',
    radiusMedium:  '0.75rem',
    radiusLarge:   '1.5rem',
    radiusFull:    '9999px',
  },
  components: {
    buttonStyle:  'filled',
    heroLayout:   'split',
    announcementText: '🥕 Fresh picks delivered same-day in your area',
  },
};

// ─── Electronics ─────────────────────────────────────────────────────────────
export const electronicsThemeDefaults: ThemeOverrides = {
  colors: {
    primary:            '#2563EB',
    secondary:          '#7C3AED',
    accent:             '#06B6D4',
    background:         '#09090B',
    surface:            '#18181B',
    text:               '#FAFAFA',
    textMuted:          '#A1A1AA',
    border:             '#27272A',
    primaryForeground:  '#FFFFFF',
  },
  typography: {
    fontDisplay:           "'Inter', system-ui, sans-serif",
    fontBody:              "'Inter', system-ui, sans-serif",
    fontWeightDisplay:     700,
    letterSpacingDisplay:  '-0.04em',
  },
  shape: {
    radiusSmall:   '0.375rem',
    radiusMedium:  '0.5rem',
    radiusLarge:   '0.75rem',
    radiusFull:    '9999px',
  },
  components: {
    buttonStyle:  'filled',
    heroLayout:   'split',
    announcementText: '🎉 Big Tech Sale — Up to 50% Off | Free Shipping Over $100',
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────
// Add new themes here as they're created.

export const THEME_DEFAULTS: Record<string, ThemeOverrides> = {
  default:        defaultThemeDefaults,
  fashion:        fashionThemeDefaults,
  beauty:         beautyThemeDefaults,
  furniture:      furnitureThemeDefaults,
  'food-grocery': foodGroceryThemeDefaults,
  electronics:    electronicsThemeDefaults,
};

/**
 * Look up the defaults for a given theme ID.
 * Falls back to `defaultThemeDefaults` if the ID isn't registered.
 */
export function getThemeDefaults(themeId: string): ThemeOverrides {
  return THEME_DEFAULTS[themeId] ?? defaultThemeDefaults;
}