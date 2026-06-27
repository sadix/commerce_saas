// src/types/default-settings.ts
import type { ThemeSettings } from './theme-settings';

/**
 * The absolute base defaults. Every theme EXTENDS this,
 * overriding only what makes it visually distinct.
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  colors: {
    primary:            '#2563EB', // blue-600
    secondary:          '#7C3AED', // violet-600
    accent:             '#DC2626', // red-600
    background:         '#FFFFFF',
    surface:            '#F9FAFB',
    text:               '#111827',
    textMuted:          '#6B7280',
    border:             '#E5E7EB',
    primaryForeground:  '#FFFFFF',
  },
  typography: {
    fontDisplay:           "'Inter', system-ui, sans-serif",
    fontBody:              "'Inter', system-ui, sans-serif",
    fontSizeBase:          '16px',
    fontWeightDisplay:     700,
    fontWeightBody:        400,
    letterSpacingDisplay:  '-0.02em',
  },
  shape: {
    radiusSmall:   '0.25rem',
    radiusMedium:  '0.5rem',
    radiusLarge:   '1rem',
    radiusFull:    '9999px',
  },
  spacing: {
    unit:               '4px',
    sectionPaddingY:    '4rem',
    containerPaddingX:  '1.5rem',
  },
  components: {
    buttonStyle:         'filled',
    heroLayout:          'centered',
    showAnnouncementBar: true,
    announcementText:    '',
  },
};