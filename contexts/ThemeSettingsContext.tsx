// src/context/ThemeSettingsContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { ThemeSettings, ThemeOverrides } from '../types/theme-settings';
import { resolveThemeSettings, settingsToCSSVars } from '../lib/theme-utils';

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeSettingsContextValue {
  /** Fully resolved settings (theme defaults merged with tenant overrides) */
  settings: ThemeSettings;
  /** Convenience accessor for color tokens */
  colors: ThemeSettings['colors'];
  /** Convenience accessor for typography tokens */
  typography: ThemeSettings['typography'];
  /** Convenience accessor for shape tokens */
  shape: ThemeSettings['shape'];
  /** Convenience accessor for component style tokens */
  components: ThemeSettings['components'];
}

const ThemeSettingsContext = createContext<ThemeSettingsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeSettingsProviderProps {
  children: React.ReactNode;
  /**
   * The theme's own default overrides (defined per theme, e.g. fashion theme's
   * off-white background, Playfair Display fonts, etc.)
   */
  themeDefaults?: ThemeOverrides;
  /**
   * The tenant's saved overrides — fetched from DB and passed in from the
   * server component that renders the storefront.
   */
  tenantOverrides?: ThemeOverrides;
}

export function ThemeSettingsProvider({
  children,
  themeDefaults = {},
  tenantOverrides = {},
}: ThemeSettingsProviderProps) {
  const settings = useMemo(
    () => resolveThemeSettings(themeDefaults, tenantOverrides),
    // Stable stringify to avoid re-renders on identical objects with different refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(themeDefaults), JSON.stringify(tenantOverrides)]
  );

  // Inject CSS custom properties into the document root on the client.
  // On the server this is handled by ThemeStyleTag (see below).
  useEffect(() => {
    const css = settingsToCSSVars(settings);
    let styleEl = document.getElementById('theme-tokens') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-tokens';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }, [settings]);

  const value = useMemo<ThemeSettingsContextValue>(() => ({
    settings,
    colors:     settings.colors,
    typography: settings.typography,
    shape:      settings.shape,
    components: settings.components,
  }), [settings]);

  return (
    <ThemeSettingsContext.Provider value={value}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThemeSettings(): ThemeSettingsContextValue {
  const ctx = useContext(ThemeSettingsContext);
  if (!ctx) {
    throw new Error('useThemeSettings must be used within a <ThemeSettingsProvider>');
  }
  return ctx;
}