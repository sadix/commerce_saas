// ===========================================
// app/api/categories/[categoryId]/attributes/route.ts
// ===========================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const {categoryId}  = await params;
  //console.log(categoryId);
  try {
    // Get all attributes for this category and its parents
    const category = await prisma.platformCategory.findUnique({
      where: { id: `gid://shopify/TaxonomyCategory/${categoryId}` },
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
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Collect all category IDs in the hierarchy
    const categoryIds: string[] = [category.id];
    let currentCategory = category.parent;
    while (currentCategory ) {
      categoryIds.push(currentCategory.id);
       /* if (Object.hasOwn(currentCategory, 'parent') && Object.hasOwn(Object(currentCategory.parent),'parent')) {
          currentCategory = Object(currentCategory.parent);
      }else{
        currentCategory = Object(currentCategory.parent);
      }  */
     currentCategory = Object(currentCategory.parent);
     if(!Object.hasOwn(Object(currentCategory), 'parent') && currentCategory){
       categoryIds.push(currentCategory.id);
       break; 
     }
     else{
      continue;
     }
    
      
    }
    console.log(categoryIds);
    // Get all attributes for these categories
    const categoryAttributes = await prisma.categoryAttribute.findMany({
      where: {
        categoryId: {
          in: categoryIds,
        },
      },
      include: {
        attribute: {
          include: {
            options: {
              orderBy: {
                value: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Remove duplicates (keep the most specific category's version)
    const seenAttributes = new Set<string>();
    const uniqueAttributes = categoryAttributes.filter((ca) => {
      if (seenAttributes.has(ca.attributeId)) {
        return false;
      }
      seenAttributes.add(ca.attributeId);
      return true;
    });

    // Transform to include required status from category-attribute relationship
    const attributes = uniqueAttributes.map((ca) => ({
      ...ca.attribute,
      required: ca.required,
    }));

    return NextResponse.json(attributes);
  } catch (error) {
    console.error('Error fetching category attributes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category attributes' },
      { status: 500 }
    );
  }
}