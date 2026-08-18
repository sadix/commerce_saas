import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {put} from '@vercel/blob'
import { logActivity } from '@/lib/activity-logger'; 



interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
  }>;
}

export async function POST(request: Request, { params }: ReqParamProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    //import data from CSV file
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers_name = rows[0];
    // Convert headers to camelCase
    const headers = headers_name.map(header => {
      return header.trim().replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
    });
    const products = rows.slice(1).map(row => {
      const product: any = {};
      headers.forEach(async (header: string, index: number) => {
        if(header !== 'id' && header !== 'shopId' && header !== 'created_at' && header !== 'updated_at' && header !== 'images'){
            product[header] = row[index];
        }
        if(header === 'price' || header === 'salePrice'){
          product[header] = parseFloat(product[header]);
        }
        if(header === 'stock'){
          product[header] = parseInt(product[header]);
        }
        if(header === 'published'){
          product[header] = product[header] === 'true';
        }
        if(header === 'images'){
            //transform blob data string to File and upload to vercel blob storage
            const blobData = row[index];
            //console.log("Blob data RAW"+blobData);
            //exract image extension from blob data string
            const extension = blobData.split(';')[0].split('/')[1];
            //const base64Data = await getTextFromUrl(blobData.replace('[', '').replace(']', ''));

            
            const blobData2 = row[index];
             //const base64Data = blobData2.replace('[', '').replace(']', '').split(';')[2];
            //console.log("base64Data:"+base64Data);
            
            
          /*   const blobDataBuffer = Buffer.from(base64Data, 'base64');
            //const blob = new Blob([blobDataBuffer], { type: `image/${extension}` });
            const file = new File([blobDataBuffer], `product-image-${Date.now()}.${extension}`, { type: `image/${extension}` });
            const blobUrl = await put(file.name, file, {
              access: 'public',
              addRandomSuffix: true,
            });
            product[header] = [`${blobUrl.url}`];  */
            product[header] = [`${blobData2}`];  
        }
      });
      return product;
    });

    console.log('Parsed products:', products);

    //insert products into database
    for (const product of products) {
      await prisma.product.create({
        data: {
          ...product,
          shopId: id,
        },
      });
    }
      await logActivity('Products imported','system', { filename: `"${file.name}"`}, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "unknown ip address");

    return NextResponse.json({ message: 'Products imported successfully' });

    //return NextResponse.json({});
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error importing products' }, { status: 500 });
  }
}

/* async function getTextFromUrl(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Converts the response body into a text string
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('Failed to fetch file:', error);
        throw error;
    }
} */