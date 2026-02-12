// lib/utils/category-helpers.ts
// Utility functions for handling deep nested categories (up to 6 levels)

'use server';
import { prisma } from '@/lib/prisma';





export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  activityId: string | null;
  children?: CategoryNode[];
  level?: number;
}

export interface CategoryPath {
  id: string;
  name: string;
  slug: string;
  activityId: string;
  level: number;
}

// ===========================================
// Build category tree from flat list
// ===========================================
/* export  async function buildCategoryTree(
  categories: CategoryNode[],
  parentId: string | null = null,
  currentLevel: number = 1
): Promise<CategoryNode[]>{
  const maxLevel = 6;
  
  if (currentLevel > maxLevel) {
    return [];
  }

  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      ...cat,
      level: currentLevel,
      children: buildCategoryTree(categories, cat.id, currentLevel + 1),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
} */



// ===========================================
// Get all descendants of a category (up to 6 levels)
// ===========================================
export async function getCategoryDescendants(
  categoryId: string,
  maxDepth: number = 6
): Promise<CategoryNode[]> {
  const descendants: CategoryNode[] = [];
  
  async function collectDescendants(parentId: string, currentDepth: number) {
    if (currentDepth > maxDepth) {
      return;
    }

    const children = await prisma.platformCategory.findMany({
      where: { parentId },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        activityId: true,
      },
    });

    for (const child of children) {
      descendants.push(child);
      await collectDescendants(child.id, currentDepth + 1);
    }
  }

  await collectDescendants(categoryId, 1);
  return descendants;
}

// ===========================================
// Get all ancestors of a category (up to 6 levels)
// ===========================================
export async function getCategoryAncestors(
  categoryId: string,
  maxDepth: number = 6
): Promise<CategoryPath[]> {
  const ancestors: CategoryPath[] = [];
  let currentId: string | null = categoryId;
  let level = 1;

  while (currentId && level <= maxDepth) {
    const category:any = await prisma.platformCategory.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        activityId:true,
      },
    });

    if (!category) break;

    ancestors.unshift({
      id: category.id,
      name: category.name,
      slug: category.slug,
      activityId: category.activityId,
      level,
    });

    currentId = category.parentId;
    level++;
  }

  return ancestors;
}

// ===========================================
// Get category with full hierarchy info
// ===========================================
export async function getCategoryWithHierarchy(categoryId: string) {
  const category = await prisma.platformCategory.findUnique({
    where: { id: categoryId },
    include: {
      parent: {
        include: {
          parent: {
            include: {
              parent: {
                include: {
                  parent: {
                    include: {
                      parent: {
                        include: {
                          parent: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      children: {
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: {
                    include: {
                      children: {
                        include: {
                          children: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      activity: true,
    },
  });

  return category;
}

// ===========================================
// Validate category depth (should not exceed 6)
// ===========================================
export async function validateCategoryDepth(
  parentId: string | null
): Promise<{ valid: boolean; currentDepth: number; error?: string }> {
  const maxDepth = 6;
  
  if (!parentId) {
    return { valid: true, currentDepth: 0 };
  }

  let depth = 1;
  let currentId: string | null = parentId;

  while (currentId && depth <= maxDepth) {
    const parent:any = await prisma.platformCategory.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    if (!parent) break;

    currentId = parent.parentId;
    depth++;
  }

  if (depth >= maxDepth) {
    return {
      valid: false,
      currentDepth: depth,
      error: `Cannot create category: maximum depth of ${maxDepth} levels would be exceeded`,
    };
  }

  return { valid: true, currentDepth: depth };
}

// ===========================================
// Get category level (1-6)
// ===========================================
export async function getCategoryLevel(categoryId: string): Promise<number> {
  let level = 1;
  let currentId: string | null = categoryId;
  const maxLevel = 6;

  const category = await prisma.platformCategory.findUnique({
    where: { id: currentId },
    select: { parentId: true },
  });

  if (!category) return 0;

  currentId = category.parentId;

  while (currentId && level < maxLevel) {
    const parent = await prisma.platformCategory.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    if (!parent) break;

    level++;
    currentId = parent.parentId;
  }

  return level;
}

// ===========================================
// Find all leaf categories in a tree
// ===========================================
export async function getLeafCategories(
  activityId?: string
): Promise<CategoryNode[]> {
  const where = activityId
    ? {
        activityId,
        children: { none: {} },
      }
    : {
        children: { none: {} },
      };

  const leafCategories = await prisma.platformCategory.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      activityId: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return leafCategories;
}

// ===========================================
// Get category siblings (same parent)
// ===========================================
export async function getCategorySiblings(
  categoryId: string
): Promise<CategoryNode[]> {
  const category = await prisma.platformCategory.findUnique({
    where: { id: categoryId },
    select: { parentId: true },
  });

  if (!category) return [];

  const siblings = await prisma.platformCategory.findMany({
    where: {
      parentId: category.parentId,
      id: { not: categoryId },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      activityId: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return siblings;
}

// ===========================================
// Search categories by name (all levels)
// ===========================================
export async function searchCategories(
  searchTerm: string,
  activityId?: string,
  limit: number = 20
): Promise<Array<CategoryNode & { path: CategoryPath[] }>> {
  const where = activityId
    ? {
        name: { contains: searchTerm, mode: 'insensitive' as const },
        OR: [
          { activityId },
          {
            parent: {
              OR: [
                { activityId },
                {
                  parent: {
                    OR: [
                      { activityId },
                      {
                        parent: {
                          OR: [
                            { activityId },
                            {
                              parent: {
                                OR: [
                                  { activityId },
                                  {
                                    parent: {
                                      activityId,
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }
    : {
        name: { contains: searchTerm, mode: 'insensitive' as const },
      };

  const categories = await prisma.platformCategory.findMany({
    where,
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      activityId: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Get path for each category
  const categoriesWithPath = await Promise.all(
    categories.map(async (cat) => ({
      ...cat,
      path: await getCategoryAncestors(cat.id),
    }))
  );

  return categoriesWithPath;
}

// ===========================================
// Get category statistics
// ===========================================
export async function getCategoryStats(categoryId: string) {
  const [
    descendantsCount,
    productCount,
    level,
    hasChildren,
  ] = await Promise.all([
    getCategoryDescendants(categoryId).then(d => d.length),
    prisma.product.count({ where: { categoryId } }),
    getCategoryLevel(categoryId),
    prisma.platformCategory.count({ where: { parentId: categoryId } }).then(c => c > 0),
  ]);

  return {
    descendantsCount,
    productCount,
    level,
    hasChildren,
    isLeaf: !hasChildren,
  };
}

// ===========================================
// Flatten category tree to array
// ===========================================
export async function flattenCategoryTree(tree: CategoryNode[]): Promise<CategoryNode[]> {
  const flattened: CategoryNode[] = [];

  function flatten(nodes: CategoryNode[]) {
    for (const node of nodes) {
      flattened.push(node);
      if (node.children && node.children.length > 0) {
        flatten(node.children);
      }
    }
  }

  flatten(tree);
  return flattened;
}

// ===========================================
// Find category in tree by ID
// ===========================================
export async function findCategoryInTree(
  tree: CategoryNode[],
  categoryId: string
): Promise<CategoryNode | null > {
  for (const node of tree) {
    if (node.id === categoryId) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findCategoryInTree(node.children, categoryId);
      if (found) return found;
    }
  }
  return null;
}