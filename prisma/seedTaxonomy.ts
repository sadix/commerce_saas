import { PrismaClient } from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.ocooskzlkwyzuswyntpu:UXl0yoKr9xsMsfq9@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
});

const prisma = new PrismaClient({adapter});



interface AttributeData {
  id: string;
  name: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface CategoryData {
  id: string;
  name: string;
  parent_id: string | null;
  attributes: Array<{
    id: string;
    name: string;
    handle: string;
    description: string;
    extended: boolean;
  }>;
  children?: CategoryData[];
}

interface ActivityData {
  name: string;
  categories: CategoryData[];
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Load JSON files
  const attributesPath = path.join(__dirname, '../data/AttributesWithId.json');
  const categoriesPath = path.join(__dirname, '../data/CategoryWithId.json');

  const attributesData: AttributeData[] = JSON.parse(
    fs.readFileSync(attributesPath, 'utf-8')
  );
  const activitiesData: ActivityData[] = JSON.parse(
    fs.readFileSync(categoriesPath, 'utf-8')
  );

  console.log(`📊 Loaded ${attributesData.length} attributes`);
  console.log(`📊 Loaded ${activitiesData.length} activities`);

  // 1. Seed Attributes
  console.log('\n📝 Seeding attributes...');
  let attributeCount = 0;
  
  for (const attr of attributesData) {
    try {
      const attribute = await prisma.attribute.upsert({
        where: { id: attr.id },
        update: {},
        create: {
          id: attr.id,
          name: attr.name,
          handle: attr.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `Attribute for ${attr.name}`,
          type: attr.type || 'select',
          required: attr.required || false,
          extended: false,
        },
      });

      // Create attribute options if they exist
      if (attr.options && attr.options.length > 0) {
        for (const option of attr.options) {
          await prisma.attributeOption.create({
            data: {
              value: option,
              attributeId: attribute.id,
            },
          }).catch(() => {}); // Ignore duplicates
        }
      }

      attributeCount++;
      if (attributeCount % 100 === 0) {
        console.log(`  ✓ Processed ${attributeCount} attributes...`);
      }
    } catch (error) {
      console.error(`  ✗ Error creating attribute ${attr.name}:`, error);
    }
  }
  console.log(`✅ Created ${attributeCount} attributes\n`);

  // 2. Seed Activities and Categories
  console.log('📦 Seeding activities and categories...');
  
  for (const activityData of activitiesData) {
    // Create Activity
    const activity = await prisma.activity.upsert({
      where: { name: activityData.name },
      update: {},
      create: {
        name: activityData.name,
        slug: activityData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
    });
    console.log(`  ✓ Created activity: ${activity.name}`);

    // Process all categories in the activity
    await seedCategories(activityData.categories, activity.id);
  }

  console.log('\n✨ Seed completed successfully!');
}

async function seedCategories(
  categories: CategoryData[],
  activityId: string,
  parentId: string | null = null
) {
  for (const categoryData of categories) {
    try {
      // Create Category
      const category = await prisma.platformCategory.upsert({
        where: { id: categoryData.id },
        update: {},
        create: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          parentId: categoryData.parent_id,
          activityId: parentId === null ? activityId : null, // Only top-level gets activityId
        },
      })

      // Associate attributes with category
      if (categoryData.attributes && categoryData.attributes.length > 0) {
        for (const attr of categoryData.attributes) {
          try {
            await prisma.categoryAttribute.create({
              data: {
                categoryId: category.id,
                attributeId: attr.id,
                required: false,
              },
            }).catch(() => {}); // Ignore duplicates
          } catch (error) {
            // Attribute might not exist, skip
          }
        }
      }

      // Recursively process children
      if (categoryData.children && categoryData.children.length > 0) {
        await seedCategories(categoryData.children, activityId, category.id);
      }
    } catch (error) {
      console.error(`  ✗ Error creating category ${categoryData.name}:`, error);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });