// src/components/ThemeStyleTag.tsx
// Use in your root layout / server component — renders a <style> tag
// so CSS vars are available before JS hydrates (no flash of unstyled content).

import type { ThemeSettings } from '../types/theme-settings';
import { settingsToCSSVars } from '../lib/theme-utils';

interface ThemeStyleTagProps {
  settings: ThemeSettings;
}

export function ThemeStyleTag({ settings }: ThemeStyleTagProps) {
  const css = settingsToCSSVars(settings);
  // dangerouslySetInnerHTML is safe here — css is generated from a typed struct,
  // never from user-authored free text.
  return (
    <style
      id="theme-tokens"
      data-theme-tokens
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}