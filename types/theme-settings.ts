// src/types/theme-settings.ts

// ─── Primitive token types ────────────────────────────────────────────────────

export type HexColor = string; // "#RRGGBB" or "#RGB"
export type CSSSize = string;  // "1rem", "16px", "0.5em"
export type FontFamily = string; // e.g. "'Playfair Display', Georgia, serif"

export type ButtonStyle = 'filled' | 'outline' | 'ghost';
export type HeroLayout = 'centered' | 'split' | 'fullbleed';
export type BorderRadiusPreset = 'sharp' | 'soft' | 'round';

// ─── Token groups ─────────────────────────────────────────────────────────────

export interface ColorTokens {
  /** Main interactive color — buttons, links, highlights */
  primary: HexColor;
  /** Supporting color for secondary actions, badges */
  secondary: HexColor;
  /** Accent / pop color — sale badges, notification dots */
  accent: HexColor;
  /** Page background */
  background: HexColor;
  /** Card / surface background (slightly offset from bg) */
  surface: HexColor;
  /** Primary text */
  text: HexColor;
  /** Subdued / caption text */
  textMuted: HexColor;
  /** Dividers and input borders */
  border: HexColor;
  /** Text that appears on top of primary-colored backgrounds */
  primaryForeground: HexColor;
}

export interface TypographyTokens {
  /** Font used for h1–h3, hero headings */
  fontDisplay: FontFamily;
  /** Font used for body copy, labels, nav */
  fontBody: FontFamily;
  /** Base font size (rem) — scales the whole type system */
  fontSizeBase: CSSSize;
  /** Weight for display / heading text */
  fontWeightDisplay: number;
  /** Weight for body text */
  fontWeightBody: number;
  /** Letter spacing for display text */
  letterSpacingDisplay: CSSSize;
}

export interface ShapeTokens {
  /** Small elements: tags, chips */
  radiusSmall: CSSSize;
  /** Default: cards, inputs, buttons */
  radiusMedium: CSSSize;
  /** Large surfaces: hero cards, modals */
  radiusLarge: CSSSize;
  /** Pill shape: pill buttons, badges */
  radiusFull: CSSSize;
}

export interface SpacingTokens {
  /** Base unit. All spacing is derived from multiples of this. */
  unit: CSSSize;
  /** Section vertical padding */
  sectionPaddingY: CSSSize;
  /** Container horizontal padding */
  containerPaddingX: CSSSize;
}

export interface ComponentStyleTokens {
  /** Primary button visual style */
  buttonStyle: ButtonStyle;
  /** Hero section layout */
  heroLayout: HeroLayout;
  /** Whether to show the announcement bar */
  showAnnouncementBar: boolean;
  /** Custom announcement bar text (empty = theme default) */
  announcementText: string;
}

// ─── The full settings object ─────────────────────────────────────────────────

export interface ThemeSettings {
  colors: ColorTokens;
  typography: TypographyTokens;
  shape: ShapeTokens;
  spacing: SpacingTokens;
  components: ComponentStyleTokens;
}

// ─── Partial override type (what a tenant actually stores) ────────────────────

/**
 * Tenants store only the tokens they've changed.
 * DeepPartial<ThemeSettings> is merged with the theme defaults at runtime.
 */
export type ThemeOverrides = DeepPartial<ThemeSettings>;

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;