import { PrismaClient } from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({adapter});

async function main() {
  console.log('Seeding database...');

  // Create default themes
  const defaultTheme = await prisma.theme.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Theme',
      slug: 'default',
      description: 'A clean and simple default theme',
      isActive: true,
    },
  });

  const modernTheme = await prisma.theme.upsert({
    where: { slug: 'modern' },
    update: {},
    create: {
      name: 'Modern Theme',
      slug: 'modern',
      description: 'A modern and stylish theme',
      isActive: true,
    },
  });

  console.log('Created themes:', { defaultTheme, modernTheme });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });