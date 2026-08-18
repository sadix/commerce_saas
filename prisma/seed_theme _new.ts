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
    name: 'Afro Market',
    slug: 'afro_market',
    description: 'Authentic theme for African fashion, crafts and lifestyle brands',
    thumbnail: '/themes/fashion-thumb.jpg',
    defaultSettings: {
  "shape": {
    "radiusFull": "9999px",
    "radiusLarge": "1rem",
    "radiusSmall": "0.25rem",
    "radiusMedium": "0.5rem"
  },
  "colors": {
    "text": "#1B1B1B",
    "accent": "#E67E22",
    "border": "#EAD8C8",
    "primary": "#A64B0B",
    "surface": "#FFF8EE",
    "secondary": "#087A57",
    "textMuted": "#6B6B6B",
    "background": "#FFF4E6",
    "primaryForeground": "#FFFFFF"
  },
  "components": {
    "heroLayout": "split",
    "buttonStyle": "filled",
    "announcementText": "Fait avec passion. Livré partout en Afrique."
  },
  "typography": {
    "fontBody": "'Inter', system-ui, sans-serif",
    "fontDisplay": "'Playfair Display', Georgia, serif",
    "fontWeightDisplay": 700,
    "letterSpacingDisplay": "0"
  }
},
  },
  {
    name: 'Digital Products',
    slug: 'digital_products',
    description: 'Modern theme for digital product, courses and download',
    thumbnail: '/themes/beauty-thumb.jpg',
    defaultSettings: {
  "shape": {
    "radiusFull": "0.75rem",
    "radiusLarge": "1rem",
    "radiusSmall": "0.375rem",
    "radiusMedium": "0.75rem"
  },
  "colors": {
    "text": "#0F172A",
    "accent": "#8B5CF6",
    "border": "#E7E1FD",
    "primary": "#7C3AED",
    "surface": "#FFFFFF",
    "secondary": "#06B6D4",
    "textMuted": "#64748B",
    "background": "#F5F3FF",
    "primaryForeground": "#FFFFFF"
  },
  "components": {
    "heroLayout": "centered",
    "buttonStyle": "filled",
    "announcementText": "Téléchargez. Apprenez. Réalisez."
  },
  "typography": {
    "fontBody": "'Inter', system-ui, sans-serif",
    "fontDisplay": "'Poppins', system-ui, sans-serif",
    "fontWeightDisplay": 700,
    "letterSpacingDisplay": "-0.02em"
  }
},
  },
  {
    name: 'Kids',
    slug: 'kids',
    description: 'Playfull and cheerful theme for kids and baby products',
    thumbnail: '/themes/furniture-thumb.jpg',
    defaultSettings: {
  "shape": {
    "radiusFull": "9999px",
    "radiusLarge": "1.5rem",
    "radiusSmall": "0.5rem",
    "radiusMedium": "1rem"
  },
  "colors": {
    "text": "#4A4A4A",
    "accent": "#FF6FAE",
    "border": "#EDE7F6",
    "primary": "#7C3AED",
    "surface": "#FFFFFF",
    "secondary": "#FFB703",
    "textMuted": "#8E8E8E",
    "background": "#F7F5FF",
    "primaryForeground": "#FFFFFF"
  },
  "components": {
    "heroLayout": "centered",
    "buttonStyle": "filled",
    "announcementText": "Tout pour vos petits, tout en douceur. 🧸"
  },
  "typography": {
    "fontBody": "'Poppins', system-ui, sans-serif",
    "fontDisplay": "'Nunito', system-ui, sans-serif",
    "fontWeightDisplay": 700,
    "letterSpacingDisplay": "-0.01em"
  }
},
  },
  {
    name: 'Pharma / Wellness',
    slug: 'pharma_wellness',
    description: 'Vibrant, friendly theme for grocery and fresh food brands',
    thumbnail: '/themes/food-grocery-thumb.jpg',
    defaultSettings: {
  "shape": {
    "radiusFull": "9999px",
    "radiusLarge": "1rem",
    "radiusSmall": "0.35rem",
    "radiusMedium": "0.75rem"
  },
  "colors": {
    "text": "#16533C",
    "accent": "#14B8A6",
    "border": "#E1F0E7",
    "primary": "#0F766E",
    "surface": "#FFFFFF",
    "secondary": "#86EFAC",
    "textMuted": "#667B72",
    "background": "#F6FCF8",
    "primaryForeground": "#FFFFFF"
  },
  "components": {
    "heroLayout": "centered",
    "buttonStyle": "filled",
    "announcementText": "Votre bien-être, tout en douceur."
  },
  "typography": {
    "fontBody": "'Inter', system-ui, sans-serif",
    "fontDisplay": "'Poppins', system-ui, sans-serif",
    "fontWeightDisplay": 700,
    "letterSpacingDisplay": "-0.02em"
  }
},
  },
  {
    name: 'Restaurant',
    slug: 'restaurant',
    description: 'Modern theme for electronics stores',
    thumbnail: '/themes/electronics-thumb.jpg',
    defaultSettings: {
  "shape": {
    "radiusFull": "9999px",
    "radiusLarge": "1rem",
    "radiusSmall": "0.5rem",
    "radiusMedium": "0.75rem"
  },
  "colors": {
    "text": "#2D1608",
    "accent": "#F66B00",
    "border": "#F3E4D7",
    "primary": "#C2410C",
    "surface": "#FFFFFF",
    "secondary": "#F59E0B",
    "textMuted": "#7C6A54",
    "background": "#FFF7ED",
    "primaryForeground": "#FFFFFF"
  },
  "components": {
    "heroLayout": "split",
    "buttonStyle": "filled",
    "announcementText": "Délicieux repas livrés rapidement chez vous."
  },
  "typography": {
    "fontBody": "'Inter', system-ui, sans-serif",
    "fontDisplay": "'Bricolage Grotesque', system-ui, sans-serif",
    "fontWeightDisplay": 800,
    "letterSpacingDisplay": "-0.03em"
  }
},
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Modern theme for electronics stores',
    thumbnail: '/themes/electronics-thumb.jpg',
    defaultSettings: {
  "shape": {
    "radiusFull": "9999px",
    "radiusLarge": "1rem",
    "radiusSmall": "0.375rem",
    "radiusMedium": "0.75rem"
  },
  "colors": {
    "text": "#111827",
    "accent": "#22C55E",
    "border": "#E5E7EB",
    "primary": "#111827",
    "surface": "#FFFFFF",
    "secondary": "#F59E0B",
    "textMuted": "#6B7280",
    "background": "#F8FAFC",
    "primaryForeground": "#FFFFFF"
  },
  "components": {
    "heroLayout": "split",
    "buttonStyle": "filled",
    "announcementText": "Move Better. Go Further. — Vivez vos limites."
  },
  "typography": {
    "fontBody": "'Inter', system-ui, sans-serif",
    "fontDisplay": "'Bebas Neue', Impact, sans-serif",
    "fontWeightDisplay": 700,
    "letterSpacingDisplay": "-0.05em"
  }
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