import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// ====================================
// Helper Functions
// ====================================

// Get available attributes for a category
export async function getAvailableAttributes(categoryId: string) {
  const categoryAttributes = await prisma.categoryAttribute.findMany({
    where: { categoryId },
    include: {
      attribute: {
        include: {
          options: true,
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return categoryAttributes.map((ca) => ({
    ...ca.attribute,
    required: ca.required,
  }));
}

// Validate product attributes against category requirements
export async function validateProductAttributes(
  categoryId: string,
  productAttributes: Array<{ attributeId: string; value: string }>
) {
  const requiredAttributes = await prisma.categoryAttribute.findMany({
    where: {
      categoryId,
      required: true,
    },
  });

  const providedAttributeIds = new Set(
    productAttributes.map((a) => a.attributeId)
  );

  const missingAttributes = requiredAttributes.filter(
    (ra) => !providedAttributeIds.has(ra.attributeId)
  );

  if (missingAttributes.length > 0) {
    const missing = await prisma.attribute.findMany({
      where: {
        id: {
          in: missingAttributes.map((ma) => ma.attributeId),
        },
      },
      select: {
        name: true,
      },
    });

    throw new Error(
      `Missing required attributes: ${missing.map((m) => m.name).join(', ')}`
    );
  }

  return true;
}


