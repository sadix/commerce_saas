// src/theme-settings/index.ts

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  ThemeSettings,
  ThemeOverrides,
  ColorTokens,
  TypographyTokens,
  ShapeTokens,
  SpacingTokens,
  ComponentStyleTokens,
  ButtonStyle,
  HeroLayout,
  HexColor,
  CSSSize,
  FontFamily,
  // DB model types
  ThemeRow,
  ShopThemeFields,
} from '../types/theme-settings';

// ── Absolute base defaults ─────────────────────────────────────────────────────
export { DEFAULT_THEME_SETTINGS } from '../types/default-settings';
// NOTE: theme-defaults.ts has been deleted.
// Theme-level defaults now live in the DB (Theme.defaultSettings) and in prisma/seed.ts.

// ── Utilities ──────────────────────────────────────────────────────────────────
export {
  resolveThemeSettings,  // (shop: ShopThemeFields) => ThemeSettings
  resolveFromParts,      // (themeDefaults, tenantOverrides) => ThemeSettings
  settingsToCSSVars,     // (settings: ThemeSettings) => string
  diffSettings,          // (draft, themeDefaults) => ThemeOverrides (minimal diff)
} from '../lib/theme-utils';

// ── React ──────────────────────────────────────────────────────────────────────
export { ThemeSettingsProvider, useThemeSettings } from '../contexts/ThemeSettingsContext';
export { ThemeStyleTag }       from '../components/ThemeStyleTag';
export { ThemeSettingsEditor } from '../components/ThemeSettingsEditor';