// prisma/seed_theme.ts
// Run once on deploy: npx prisma db seed
// Inserts all themes with their defaultSettings into the DB.
// After this, theme-defaults.ts is no longer needed — delete it.

import { PrismaClient } from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import type { ThemeOverrides } from '../types/theme-settings';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://baobuy:mybaopassword@tinehouse.duckdns.org:5432/baobuydb",
});

const prisma = new PrismaClient({adapter});

// ─── Theme default settings ───────────────────────────────────────────────────
// These are the token overrides that define each theme's visual identity.
// They live here (and in the DB) instead of theme-defaults.ts.

const themes: Array<{
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  defaultSettings: ThemeOverrides;
}> = [
  {
    name: 'Default',
    slug: 'default',
    description: 'A clean and simple default theme',
    thumbnail: '/themes/default-thumb.jpg',
    defaultSettings: {}, // inherits DEFAULT_THEME_SETTINGS unchanged
  },
  {
    name: 'Fashion Edit',
    slug: 'fashion',
    description: 'Editorial theme for apparel and fashion brands',
    thumbnail: '/themes/fashion-thumb.jpg',
    defaultSettings: {
      colors: {
        primary:           '#0A0A0A',
        secondary:         '#C9A896',
        accent:            '#C9A896',
        background:        '#FAFAF8',
        surface:           '#FAFAF8',
        text:              '#0A0A0A',
        textMuted:         '#6B6B69',
        border:            '#0A0A0A',
        primaryForeground: '#FAFAF8',
      },
      typography: {
        fontDisplay:          "'Playfair Display', Georgia, serif",
        fontBody:             "'Inter', system-ui, sans-serif",
        fontWeightDisplay:    500,
        letterSpacingDisplay: '0.05em',
      },
      shape: {
        radiusSmall:  '0',
        radiusMedium: '0',
        radiusLarge:  '0',
        radiusFull:   '0',
      },
      components: {
        buttonStyle:      'outline',
        heroLayout:       'split',
        announcementText: 'New Season — Free Returns Within 30 Days',
      },
    },
  },
  {
    name: 'Glow Beauty',
    slug: 'beauty',
    description: 'Soft, radiant theme for beauty and skincare brands',
    thumbnail: '/themes/beauty-thumb.jpg',
    defaultSettings: {
      colors: {
        primary:           '#E8A0A0',
        secondary:         '#F4C9A8',
        accent:            '#D4587A',
        background:        '#FFF5F3',
        surface:           '#FFFFFF',
        text:              '#2D2424',
        textMuted:         '#8C6B6B',
        border:            '#F0D8D0',
        primaryForeground: '#2D2424',
      },
      typography: {
        fontDisplay:          "'Cormorant Garamond', Georgia, serif",
        fontBody:             "'Poppins', system-ui, sans-serif",
        fontWeightDisplay:    500,
        letterSpacingDisplay: '0',
      },
      shape: {
        radiusSmall:  '0.5rem',
        radiusMedium: '1rem',
        radiusLarge:  '2rem',
        radiusFull:   '9999px',
      },
      components: {
        buttonStyle:      'filled',
        heroLayout:       'centered',
        announcementText: '✨ Free samples on every order',
      },
    },
  },
  {
    name: 'Craft Furniture',
    slug: 'furniture',
    description: 'Warm, earthy theme for furniture and home goods brands',
    thumbnail: '/themes/furniture-thumb.jpg',
    defaultSettings: {
      colors: {
        primary:           '#2B2420',
        secondary:         '#B08968',
        accent:            '#7C9070',
        background:        '#F5F0E8',
        surface:           '#EDE8DC',
        text:              '#2B2420',
        textMuted:         '#7A6E65',
        border:            '#D9D1C3',
        primaryForeground: '#F5F0E8',
      },
      typography: {
        fontDisplay:          "'Fraunces', Georgia, serif",
        fontBody:             "'Karla', system-ui, sans-serif",
        fontWeightDisplay:    500,
        letterSpacingDisplay: '-0.01em',
      },
      shape: {
        radiusSmall:  '0.125rem',
        radiusMedium: '0.25rem',
        radiusLarge:  '0.5rem',
        radiusFull:   '0.5rem',
      },
      components: {
        buttonStyle:      'filled',
        heroLayout:       'split',
        announcementText: 'Handmade in small batches — free delivery over $500',
      },
    },
  },
  {
    name: 'Fresh Market',
    slug: 'food-grocery',
    description: 'Vibrant, friendly theme for grocery and fresh food brands',
    thumbnail: '/themes/food-grocery-thumb.jpg',
    defaultSettings: {
      colors: {
        primary:           '#1F4D2C',
        secondary:         '#F2A03D',
        accent:            '#E85D4C',
        background:        '#FFFBF2',
        surface:           '#FFFFFF',
        text:              '#1A2E1E',
        textMuted:         '#4A6354',
        border:            '#D4E6DA',
        primaryForeground: '#FFFBF2',
      },
      typography: {
        fontDisplay:          "'Bricolage Grotesque', system-ui, sans-serif",
        fontBody:             "'Inter', system-ui, sans-serif",
        fontWeightDisplay:    800,
        letterSpacingDisplay: '-0.03em',
      },
      shape: {
        radiusSmall:  '0.5rem',
        radiusMedium: '0.75rem',
        radiusLarge:  '1.5rem',
        radiusFull:   '9999px',
      },
      components: {
        buttonStyle:      'filled',
        heroLayout:       'split',
        announcementText: '🥕 Fresh picks delivered same-day in your area',
      },
    },
  },
  {
    name: 'Electronics Shop',
    slug: 'electronics',
    description: 'Modern theme for electronics stores',
    thumbnail: '/themes/electronics-thumb.jpg',
    defaultSettings: {
      colors: {
        primary:           '#2563EB',
        secondary:         '#7C3AED',
        accent:            '#06B6D4',
        background:        '#09090B',
        surface:           '#18181B',
        text:              '#FAFAFA',
        textMuted:         '#A1A1AA',
        border:            '#27272A',
        primaryForeground: '#FFFFFF',
      },
      typography: {
        fontDisplay:          "'Inter', system-ui, sans-serif",
        fontBody:             "'Inter', system-ui, sans-serif",
        fontWeightDisplay:    700,
        letterSpacingDisplay: '-0.04em',
      },
      shape: {
        radiusSmall:  '0.375rem',
        radiusMedium: '0.5rem',
        radiusLarge:  '0.75rem',
        radiusFull:   '9999px',
      },
      components: {
        buttonStyle:      'filled',
        heroLayout:       'split',
        announcementText: '🎉 Big Tech Sale — Up to 50% Off | Free Shipping Over $100',
      },
    },
  },
  // ── Add new themes here as you build them ────────────────────────────────
  // The remaining 14 themes from the batch generation will be added here.
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding themes...');

  for (const theme of themes) {
    await prisma.theme.upsert({
      where:  { slug: theme.slug },
      update: {
        name:            theme.name,
        description:     theme.description,
        thumbnail:       theme.thumbnail,
        defaultSettings: theme.defaultSettings,
      },
      create: {
        name:            theme.name,
        slug:            theme.slug,
        description:     theme.description,
        thumbnail:       theme.thumbnail,
        defaultSettings: theme.defaultSettings,
        isActive:        true,
      },
    });
    console.log(`  ✓ ${theme.name} (${theme.slug})`);
  }

  console.log(`Done — ${themes.length} themes seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());