// src/types/theme-settings.ts

// ─── Primitive token types ────────────────────────────────────────────────────

export type HexColor = string;  // "#RRGGBB" or "#RGB"
export type CSSSize = string;   // "1rem", "16px", "0.5em"
export type FontFamily = string; // e.g. "'Playfair Display', Georgia, serif"

export type ButtonStyle = 'filled' | 'outline' | 'ghost';
export type HeroLayout  = 'centered' | 'split' | 'fullbleed';

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
  /** Base font size */
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
  /** Pill shape */
  radiusFull: CSSSize;
}

export interface SpacingTokens {
  /** Base spacing unit */
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
  /** Announcement bar text — empty string means theme default */
  announcementText: string;
}

// ─── Full settings object ─────────────────────────────────────────────────────

export interface ThemeSettings {
  colors:     ColorTokens;
  typography: TypographyTokens;
  shape:      ShapeTokens;
  spacing:    SpacingTokens;
  components: ComponentStyleTokens;
}

// ─── Partial override — what gets stored in the DB ────────────────────────────

/**
 * Both Theme.defaultSettings and Shop.themeOverrides use this type.
 * Only the tokens that differ from DEFAULT_THEME_SETTINGS are stored.
 */
export type ThemeOverrides = DeepPartial<ThemeSettings>;

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// ─── DB model types ───────────────────────────────────────────────────────────

/**
 * Mirrors the Prisma Theme model exactly.
 * defaultSettings is a Json? column — the theme's token overrides on top of
 * DEFAULT_THEME_SETTINGS. This replaces the old hardcoded theme-defaults.ts.
 */
export interface ThemeRow {
  id:             string;
  name:           string;
  slug:           string;
  description:    string | null;
  thumbnail:      string | null;
  isActive:       boolean;
  defaultSettings: ThemeOverrides | null;
  created_at:     Date;
  updated_at:     Date;
}

/**
 * The theme-relevant fields from a Shop row, with related Theme included.
 * Pass this to resolveThemeSettings() and ThemeSettingsProvider.
 */
export interface ShopThemeFields {
  themeId:        string;
  theme:          Pick<ThemeRow, 'id' | 'slug' | 'defaultSettings'>;
  /** The tenant's personalised token changes — layered on top of theme.defaultSettings */
  themeOverrides: ThemeOverrides | null;
}