// app/api/categories/[categoryId]/path/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



/**
 * GET /api/categories/{categoryId}/path
 * Returns the full path from root to the specified category
 * Used for product editing to reconstruct the category navigation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const catId= await params;
  try {
    const categoryId = `gid://shopify/TaxonomyCategory/${catId.categoryId}`;
    
    // Get category with up to 6 levels of parents
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
                            translations: true,
                          },
                        },
                        translations: true,
                      },
                    },
                    translations: true,
                  },
                },
                translations: true,
              },
              
            },
            translations: true,
          },
          
        },
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
        translations: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Build path array from root to current category
    const path: Array<{
      id: string;
      name: string;
      slug: string;
      parentId: string | null;
      activityId: string | null;
      level: number;
    }> = [];

    let currentCategory: any = category;
    let level = 1;
    const maxDepth = 6;

    // Collect path from current up to root
    const tempPath: any[] = [];
    while (currentCategory && level <= maxDepth) {
      tempPath.unshift({
        id: currentCategory.id,
        name: currentCategory.name,
        slug: currentCategory.slug,
        parentId: currentCategory.parentId,
        activityId: currentCategory.activityId || category.activity?.id || null,
        translations: currentCategory.translations || [],
        level: level,
      });
      currentCategory = currentCategory.parent;
      level++;
    }

    // Add activity info to first element if available
    if (tempPath.length > 0 && category.activity) {
      tempPath[0].activityId = category.activity.id;
      tempPath[0].activityName = category.activity.name;
    }

    return NextResponse.json(tempPath);
  } catch (error) {
    console.error('Error fetching category path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category path' },
      { status: 500 }
    );
  }
}

// Alternative optimized version using recursive query (PostgreSQL)
export async function GET_OPTIMIZED(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = `gid://shopify/TaxonomyCategory/${params.categoryId}`;
    
    // Use recursive CTE to get full path efficiently
    const path = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        slug: string;
        parentId: string | null;
        activityId: string | null;
        level: number;
      }>
    >`
      WITH RECURSIVE category_path AS (
        -- Base case: the selected category
        SELECT 
          id, 
          name, 
          slug, 
          "parentId", 
          "activityId",
          1 as level
        FROM categories
        WHERE id = ${categoryId}
        
        UNION ALL
        
        -- Recursive case: parent categories
        SELECT 
          c.id, 
          c.name, 
          c.slug, 
          c."parentId", 
          c."activityId",
          cp.level + 1
        FROM categories c
        INNER JOIN category_path cp ON c.id = cp."parentId"
        WHERE cp.level < 6
      )
      SELECT 
        id, 
        name, 
        slug, 
        "parentId", 
        "activityId",
        level
      FROM category_path
      ORDER BY level DESC
    `;

    if (path.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get activity info for the root category
    const rootCategory = path[0];
    if (rootCategory.activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: rootCategory.activityId },
        select: { id: true, name: true },
      });
      
      if (activity) {
        (rootCategory as any).activityName = activity.name;
      }
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error('Error fetching category path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category path' },
      { status: 500 }
    );
  }
}