// src/components/ThemeStyleTag.tsx
// Server component — inject CSS vars into <head> before JS hydrates.
// Prevents flash of unstyled content.

import type { ShopThemeFields } from '../types/theme-settings';
import { resolveThemeSettings, settingsToCSSVars } from '../lib/theme-utils';

interface ThemeStyleTagProps {
  /** Pass the shop object (same shape as ThemeSettingsProvider) */
  shop: ShopThemeFields;
}

export function ThemeStyleTag({ shop }: ThemeStyleTagProps) {
  const settings = resolveThemeSettings(shop);
  const css = settingsToCSSVars(settings);

  return (
    <style
      id="theme-tokens"
      data-theme-tokens
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}