import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '@/components/storefront/ThemeRenderer';

interface PageProps {
  params: {
    subdomain: string;
    slug: string;
  };
}

export default async function StorePage({ params }: PageProps) {
  const { subdomain, slug } = await params;

  const shop = await prisma.shop.findUnique({
    where: { subdomain },
    include: {
      theme: true,
      pages: {
        where: { published: true },
        orderBy: { created_at: 'asc' },
      },
    },
  });

  if (!shop) {
    notFound();
  }

  //const page = shop.pages[0];
  const page = shop.pages.find(p => p.slug === slug);

  if (!page || !page.published) {
    notFound();
  }

  return (
    <ThemeRenderer
      blocks={page.layout as any[]}
      themeSlug={shop.theme?.slug || 'default'}
      shopData={{
        name: shop.name,
        logoUrl: shop.logoUrl || undefined,
        subdomain: shop.subdomain,
      }}
      pages={shop.pages.map(p => ({
        title: p.title,
        slug: p.slug,
        showInNav: p.showInNav ?? true,
      }))}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { subdomain, slug } = await params;
  const shop = await prisma.shop.findUnique({
    where: { subdomain: subdomain },
    include: {
      pages: {
        where: { slug: slug },
      },
    },
  });

  if (!shop || !shop.pages[0]) {
    return {
      title: 'Page Not Found',
    };
  }

  const page = shop.pages[0];

  return {
    title: `${page.title} - ${shop.name}`,
    description: shop.description || `${page.title} at ${shop.name}`,
  };
}