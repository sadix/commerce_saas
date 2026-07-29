import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canCreateShop, gateResponse } from '@/lib/access-control';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shops = await prisma.shop.findMany({
    where: { userId: session.user.id },
    include: { theme: true },
  });

  return NextResponse.json(shops);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gate = await canCreateShop(session.user.id);
  if (!gate.allowed) {
    //return gateResponse(gate);
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const body = await request.json();
  const { name, subdomain } = body;

  if (!name || !subdomain) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if subdomain is available
  const existing = await prisma.shop.findUnique({
    where: { subdomain },
  });

  if (existing) {
    return NextResponse.json({ error: 'Subdomain already taken' }, { status: 400 });
  }

  // Get default theme
  const defaultTheme = await prisma.theme.findFirst({
    where: { slug: 'default' },
  });

  // Create shop
  const shop = await prisma.shop.create({
    data: {
      name,
      subdomain,
      userId: session.user.id,
      themeId: defaultTheme?.id,
    },
  });

  // Create domain record
  await prisma.domain.create({
    data: {
      shopId: shop.id,
      domain: `${subdomain}.baobuy.site`,
    },
  });

  // Create default home page
  await prisma.page.create({
    data: {
      shopId: shop.id,
      slug: 'home',
      title: 'Accueil',
      isHome: true,
      layout: [
        {
          id: 'header-1',
          type: 'Header',
          props: {},
        },
        {
          id: 'hero-1',
          type: 'Hero',
          props: {
            title: `Bienvenue sur ${name}`,
            subtitle: 'Votre boutique en ligne',
          },
        },
        {
          id: 'features-1',
          type: 'Features',
          props: {},
        },
        {
          id: 'footer-1',
          type: 'Footer',
          props: {},
        },
      ],
    },
  });

  //Create product Page
  await prisma.page.create({
    data : {
      shopId: shop.id,
      slug: 'produits',
      title: 'Boutique',
      isHome: false,
      layout: [
                {
                  "id": "block-001",
                  "type": "Header",
                  "props": {
                  }
                },
                {
                  "id": "block-002",
                  "type": "ProductsList",
                  "props": {
                    "title": "Nos Produits",
                    "layout": "grid",
                    "shopId": shop.id,
                    "columns": 3,
                    "subtitle": "Choisissez parmi notre sélection de produits de qualité",
                    "showFilters": true
                  }
                },
                
                {
                  "id": "block-003",
                  "type": "Footer",
                  "props": {

                  }
                }
              ]
    }
  });

  //Create default collection
  const defaultCollection = await prisma.category.create({
    data: {
      shopId: shop.id,
      name: 'Default Collection',
      slug: 'default-collection',
    }
  });


  //Create sample product
  await prisma.product.create({
    data: {
      shopId: shop.id,
      name: 'Mon produit',
      description: 'Produit Exemple',
      price: 1000,
      images : ["https://knawjdpypznesc6w.public.blob.vercel-storage.com/cmkimt3ti000i20w0oo8d2xth_repared.png"],
      stock: 1,
      published: true,
      categoryId: defaultCollection.id,
      hasVariations: false,
      sku: 'SKU-001',
      platform_categoryId: 'gid://shopify/TaxonomyCategory/aa-1-13-8'


    }
  });

  return NextResponse.json(shop, { status: 201 });
}