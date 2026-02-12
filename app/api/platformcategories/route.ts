// ===========================================
// app/api/activities/[activityId]/categories/route.ts
// ===========================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: NextRequest,
 
) {
  const searchParams = request.nextUrl.searchParams;
  const shopId = searchParams.get('shopid') || 'platform';
  try {
    const categories = await prisma.platformCategory.findMany({
     
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
      orderBy: {
        name: 'asc',
      },
    });

    // Build complete category tree including all descendants
    const allCategories = await prisma.platformCategory.findMany({
      where: {
        OR: [
          { activityId: { not :null} },
          {
            parent: {
              activityId: { not :null},
            },
          },
        ],
      },
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
      orderBy: {
        name: 'asc',
      },
    });


    const allCategoriesNested = await prisma.platformCategory.findMany({
      where: {
        OR: [
          { activityId: { not :null} },
          {
            parent: {
              OR: [
                { activityId :{ not :null} },
                {
                  parent: {
                    OR: [
                      { activityId: { not :null} },
                      {
                        parent: {
                          OR: [
                            { activityId: { not :null} },
                            {
                              parent: {
                                OR: [
                                  { activityId: { not :null} },
                                  {
                                    parent: {
                                      activityId: { not :null},
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
        AND:[
            {
            products: {
                   some:{shopId:shopId},
            }
        }
        ]
      },
      include: {
      _count: {
        select: { products: {
          where: {shopId:shopId}
        }

        },
      },
     },
      orderBy: {
        name: 'asc',
      },
    });


    return NextResponse.json(allCategoriesNested);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}


// Alternative optimized approach using recursive CTE (if your DB supports it)
export async function GET_WITH_CTE(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    // For PostgreSQL with recursive CTE
    const categories = await prisma.$queryRaw`
      WITH RECURSIVE category_tree AS (
        -- Base case: direct children of activity
        SELECT id, name, slug, "parentId", "activityId", 1 as depth
        FROM categories
        WHERE "activityId" = ${params.activityId}
        
        UNION ALL
        
        -- Recursive case: children of categories in tree
        SELECT c.id, c.name, c.slug, c."parentId", c."activityId", ct.depth + 1
        FROM categories c
        INNER JOIN category_tree ct ON c."parentId" = ct.id
        WHERE ct.depth < 6
      )
      SELECT DISTINCT id, name, slug, "parentId", "activityId"
      FROM category_tree
      ORDER BY name ASC
    `;

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories with CTE:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}