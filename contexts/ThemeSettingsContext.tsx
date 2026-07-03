// src/context/ThemeSettingsContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { ThemeSettings, ThemeOverrides, ShopThemeFields } from '../types/theme-settings';
import { resolveThemeSettings, settingsToCSSVars } from '../lib/theme-utils';

// ─── Context value ────────────────────────────────────────────────────────────

interface ThemeSettingsContextValue {
  /** Fully resolved settings — DEFAULT + theme.defaultSettings + shop.themeOverrides */
  settings:   ThemeSettings;
  colors:     ThemeSettings['colors'];
  typography: ThemeSettings['typography'];
  shape:      ThemeSettings['shape'];
  components: ThemeSettings['components'];
}

const ThemeSettingsContext = createContext<ThemeSettingsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeSettingsProviderProps {
  children: React.ReactNode;
  /**
   * Pass the shop's theme-related DB fields directly.
   * The provider resolves DEFAULT → theme.defaultSettings → themeOverrides internally.
   *
   * Example (from your server component):
   *   shop = await db.shop.findUnique({
   *     where: { subdomain },
   *     include: { theme: { select: { id, slug, defaultSettings } } },
   *   });
   *   <ThemeSettingsProvider shop={shop} />
   */
  shop: ShopThemeFields;
}

export function ThemeSettingsProvider({ children, shop }: ThemeSettingsProviderProps) {
  const settings = useMemo(
    () => resolveThemeSettings(shop),
    // stable stringify avoids re-renders when parent re-renders with identical data
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(shop.theme.defaultSettings), JSON.stringify(shop.themeOverrides)]
  );

  // Sync CSS vars to document root on the client side.
  // On the server this is handled by <ThemeStyleTag> (no flash of unstyled content).
  useEffect(() => {
    const css = settingsToCSSVars(settings);
    let el = document.getElementById('theme-tokens') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'theme-tokens';
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [settings]);

  const value = useMemo<ThemeSettingsContextValue>(
    () => ({
      settings,
      colors:     settings.colors,
      typography: settings.typography,
      shape:      settings.shape,
      components: settings.components,
    }),
    [settings]
  );

  return (
    <ThemeSettingsContext.Provider value={value}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThemeSettings(): ThemeSettingsContextValue {
  const ctx = useContext(ThemeSettingsContext);
  if (!ctx) throw new Error('useThemeSettings must be used within <ThemeSettingsProvider>');
  return ctx;
}