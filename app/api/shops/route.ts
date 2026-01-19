import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      domain: `${subdomain}.yourdomain.com`,
    },
  });

  // Create default home page
  await prisma.page.create({
    data: {
      shopId: shop.id,
      slug: 'home',
      title: 'Home',
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
            title: `Welcome to ${name}`,
            subtitle: 'Your new online store',
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

  return NextResponse.json(shop, { status: 201 });
}