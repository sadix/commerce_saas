import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger'; 


interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const { id } = await params;
  const products = await prisma.product.findMany({
    where: { shopId: id },
    orderBy: { created_at: 'desc' },
    include: {
      attributes:{
        include:{attribute:true}
      },
      platform_category: true,
    }
  });

  const csvHeaders = [
    'id',
    'name',
    'description',
    'price',
    'stock',
    'categoryId',
    'sku',
    'published',
    'platform_categoryId',
    'created_at',
    'updated_at',
    'images'
  ];

  async function fileUrlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL. Status: ${response.status}`);
  }
  
  return await response.blob();
}

  const csvRows = await Promise.all(products.map(async product => {
    //const platformCategoryName = product.platform_category ? product.platform_category.name : '';
   /*  let image_blob: Blob | null = null;
    try {
      if (product.images[0]) {
        image_blob = await fileUrlToBlob(product.images[0]);
      }
    } catch (error) {
      console.error(`Error fetching image for product ${product.id}:`, error);
    }

    const imageBlobString = image_blob ? Buffer.from(await image_blob.arrayBuffer()).toString('base64') : '';
    const imageBlobDataUrl = image_blob ? `data:${image_blob.type};base64;${imageBlobString}` : ''; */
    
    return [
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock,
      product.categoryId,
      product.sku,
      product.published ? 'true' : 'false',
      //platformCategoryName,
      product.platform_categoryId,
      product.created_at,
      product.updated_at,
      //`["${imageBlobDataUrl}"]`
      product.images
    ];
  }));

  const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');

  await logActivity('Page Updated','system', { filename: `"products-${id}.csv"`}, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "unknown ip address");


  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="products-${id}.csv"`
    }
  });
}