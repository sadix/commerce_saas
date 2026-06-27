// src/utils/theme-utils.ts
import type { ThemeSettings, ThemeOverrides } from '../types/theme-settings';
import { DEFAULT_THEME_SETTINGS } from '../types/default-settings';

// ─── Deep merge ───────────────────────────────────────────────────────────────

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: DeepPartialRecord<T>): T {
  const result = { ...base };
  for (const key in override) {
    const baseVal = base[key];
    const overVal = override[key];
    if (isObject(baseVal) && isObject(overVal)) {
      // @ts-expect-error deep recursion
      result[key] = deepMerge(baseVal, overVal);
    } else if (overVal !== undefined) {
      // @ts-expect-error key assignment
      result[key] = overVal;
    }
  }
  return result;
}

type DeepPartialRecord<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartialRecord<T[P]> : T[P];
};

/**
 * Resolve a final ThemeSettings object:
 * 1. Start with global DEFAULT_THEME_SETTINGS
 * 2. Merge theme-level defaults (the theme's own personality)
 * 3. Merge tenant overrides (what this particular shop changed)
 */
export function resolveThemeSettings(
  themeDefaults: ThemeOverrides = {},
  tenantOverrides: ThemeOverrides = {}
): ThemeSettings {
  const withTheme = deepMerge(DEFAULT_THEME_SETTINGS as DeepPartialRecord<ThemeSettings>, themeDefaults as DeepPartialRecord<ThemeSettings>);
  return deepMerge(withTheme, tenantOverrides as DeepPartialRecord<ThemeSettings>) as ThemeSettings;
}

// ─── CSS custom properties ────────────────────────────────────────────────────

/**
 * Convert a resolved ThemeSettings object into a CSS string of
 * :root { --token-name: value; } declarations.
 * Components reference these as var(--color-primary), etc.
 */
export function settingsToCSSVars(settings: ThemeSettings): string {
  const { colors, typography, shape, spacing } = settings;

  const vars: Record<string, string> = {
    // Colors
    '--color-primary':             colors.primary,
    '--color-secondary':           colors.secondary,
    '--color-accent':              colors.accent,
    '--color-background':          colors.background,
    '--color-surface':             colors.surface,
    '--color-text':                colors.text,
    '--color-text-muted':          colors.textMuted,
    '--color-border':              colors.border,
    '--color-primary-foreground':  colors.primaryForeground,

    // Typography
    '--font-display':              typography.fontDisplay,
    '--font-body':                 typography.fontBody,
    '--font-size-base':            typography.fontSizeBase,
    '--font-weight-display':       String(typography.fontWeightDisplay),
    '--font-weight-body':          String(typography.fontWeightBody),
    '--letter-spacing-display':    typography.letterSpacingDisplay,

    // Shape
    '--radius-sm':   shape.radiusSmall,
    '--radius-md':   shape.radiusMedium,
    '--radius-lg':   shape.radiusLarge,
    '--radius-full': shape.radiusFull,

    // Spacing
    '--space-unit':                spacing.unit,
    '--section-padding-y':         spacing.sectionPaddingY,
    '--container-padding-x':       spacing.containerPaddingX,
  };

  const declarations = Object.entries(vars)
    .map(([prop, val]) => `  ${prop}: ${val};`)
    .join('\n');

  return `:root {\n${declarations}\n}`;
}

/**
 * For server components: returns an inline <style> string ready to inject
 * into <head> or at the top of the page layout.
 */
export function buildThemeStyleTag(settings: ThemeSettings): string {
  return `<style data-theme-tokens>${settingsToCSSVars(settings)}</style>`;
}