// src/utils/theme-utils.ts
import type { ThemeSettings, ThemeOverrides, ThemeRow, ShopThemeFields } from '../types/theme-settings';
import { DEFAULT_THEME_SETTINGS } from '../types/default-settings';

// ─── Deep merge ───────────────────────────────────────────────────────────────

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>
): T {
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

// ─── Resolution ───────────────────────────────────────────────────────────────

/**
 * Resolve a final ThemeSettings object from a shop row (which includes
 * its related Theme with defaultSettings from the DB).
 *
 * Resolution order (each layer overrides the previous):
 *   1. DEFAULT_THEME_SETTINGS     — hardcoded absolute base
 *   2. theme.defaultSettings      — the theme's identity (stored in Theme DB row)
 *   3. shop.themeOverrides        — this tenant's personalised changes
 */
export function resolveThemeSettings(shop: ShopThemeFields): ThemeSettings {
  let resolved = { ...DEFAULT_THEME_SETTINGS };

  if (shop.theme.defaultSettings) {
    resolved = deepMerge(resolved, shop.theme.defaultSettings as Record<string, unknown>);
  }

  if (shop.themeOverrides) {
    resolved = deepMerge(resolved, shop.themeOverrides as Record<string, unknown>);
  }

  return resolved;
}

/**
 * Resolve settings from raw parts — useful in the editor or seed script
 * where you have the pieces separately.
 */
export function resolveFromParts(
  themeDefaultSettings: ThemeOverrides | null,
  tenantOverrides: ThemeOverrides | null
): ThemeSettings {
  return resolveThemeSettings({
    themeId: '',
    theme: { id: '', slug: '', defaultSettings: themeDefaultSettings },
    themeOverrides: tenantOverrides,
  });
}

// ─── CSS custom properties ────────────────────────────────────────────────────

/**
 * Convert a resolved ThemeSettings object into a CSS :root block.
 * Components reference tokens as var(--color-primary), var(--font-display), etc.
 */
export function settingsToCSSVars(settings: ThemeSettings): string {
  const { colors, typography, shape, spacing } = settings;

  const vars: Record<string, string> = {
    // Colors
    '--color-primary':            colors.primary,
    '--color-secondary':          colors.secondary,
    '--color-accent':             colors.accent,
    '--color-background':         colors.background,
    '--color-surface':            colors.surface,
    '--color-text':               colors.text,
    '--color-text-muted':         colors.textMuted,
    '--color-border':             colors.border,
    '--color-primary-foreground': colors.primaryForeground,

    // Typography
    '--font-display':             typography.fontDisplay,
    '--font-body':                typography.fontBody,
    '--font-size-base':           typography.fontSizeBase,
    '--font-weight-display':      String(typography.fontWeightDisplay),
    '--font-weight-body':         String(typography.fontWeightBody),
    '--letter-spacing-display':   typography.letterSpacingDisplay,

    // Shape
    '--radius-sm':   shape.radiusSmall,
    '--radius-md':   shape.radiusMedium,
    '--radius-lg':   shape.radiusLarge,
    '--radius-full': shape.radiusFull,

    // Spacing
    '--space-unit':           spacing.unit,
    '--section-padding-y':    spacing.sectionPaddingY,
    '--container-padding-x':  spacing.containerPaddingX,
  };

  const declarations = Object.entries(vars)
    .map(([prop, val]) => `  ${prop}: ${val};`)
    .join('\n');

  return `:root {\n${declarations}\n}`;
}

// ─── Diff — compute minimal overrides to save ─────────────────────────────────

/**
 * Compare a draft ThemeSettings against the theme's defaults and return only
 * the keys that differ. This is what gets saved to Shop.themeOverrides in the DB.
 */
export function diffSettings(
  draft: ThemeSettings,
  themeDefaultSettings: ThemeOverrides | null
): ThemeOverrides {
  const base = resolveFromParts(themeDefaultSettings, null);
  const overrides: Record<string, Record<string, unknown>> = {};

  for (const group of Object.keys(draft) as Array<keyof ThemeSettings>) {
    const draftGroup  = draft[group] as unknown  as Record<string, unknown>;
    const baseGroup   = base[group] as unknown as Record<string, unknown>;

    for (const key of Object.keys(draftGroup)) {
      if (draftGroup[key] !== baseGroup[key]) {
        overrides[group] = overrides[group] ?? {};
        overrides[group][key] = draftGroup[key];
      }
    }
  }

  return overrides as ThemeOverrides;
}