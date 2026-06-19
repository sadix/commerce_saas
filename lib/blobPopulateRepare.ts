
import {put} from '@vercel/blob'

import { PrismaClient } from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { startsWith } from 'zod';
import { equal } from 'node:assert';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.ocooskzlkwyzuswyntpu:UXl0yoKr9xsMsfq9@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
});

const prisma = new PrismaClient({adapter});


async function getTextFromUrl(url: string): Promise<string> {
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
}

export async function populateBlobs() {
    //find all Products with images fields updated today, extract data from the image file and convert from data image to png

    const products = await prisma.product.findMany();

    const filteredProducts = products.filter(product => product.updated_at >= new Date('2026-05-25 16:00:00') );

    console.log(`Found ${filteredProducts.length} products with base64 images. Uploading to blob storage...`);

    //ask user confirmation before proceeding
    const confirm = await new Promise( async (resolve) => {
        const rl = readline.createInterface({
            input,
            output
        });
        /* rl.question('Proceed with blob population? (y/n): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        }); */

        const answer = await rl.question('Proceed with blob population? (y/n): ');
        rl.close();
        resolve(answer.toLowerCase() === 'y');
    });

    if (!confirm) {
        console.log('Operation cancelled.');
        return;
    }

    for (const product of filteredProducts) {
        //convert base64 into image with url and upload to vercel blob storage
        const file_url = product.images[0];
        // Read file as text and extract base64
        const base64Data = await getTextFromUrl(file_url);

        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        const file = new File([imageBuffer], product.id+'_repared.png', { type: 'image/png' });
        const { url } = await put(file.name,file, {
            access: 'public',
            token: "vercel_blob_rw_knAWjdPYPzneSC6W_qH6g7TbMFwtgo7MM17cg4wM4d9ZMrV",
        });
        await prisma.product.update({
            where: { id: product.id },
            data: { images: [url] },
        });
    }

}

async function main() {
    console.log('🌱 Starting blob population...');
    await populateBlobs();
    console.log('✅ Blob population completed!');
}

main()
    .catch((e) => {
        console.error('Error populating blobs:', e); 
    });