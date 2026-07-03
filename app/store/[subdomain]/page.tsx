import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '@/components/storefront/ThemeRenderer';

interface StorefrontPageProps {
  params: {
    subdomain: string;
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { subdomain } = await params;

  // Find shop by subdomain
  const shop = await prisma.shop.findUnique({
    where: { subdomain },
    include: {
      theme: true,
      pages: true,
    },
  });

  if (!shop) {
    notFound();
  }

  const homePage = shop.pages[0];

  if (!homePage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{shop.name}</h1>
          <p className="text-gray-600">This store is being set up. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeRenderer
      blocks={homePage.layout as any[]}
      themeSlug={'default'}
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

// Generate metadata for SEO
export async function generateMetadata({ params }: StorefrontPageProps) {
  const { subdomain } = await params;
  const shop = await prisma.shop.findUnique({
    where: { subdomain: subdomain },
  });

  if (!shop) {
    return {
      title: 'Store Not Found',
    };
  }

  return {
    title: shop.name,
    description: shop.description || `Welcome to ${shop.name}`,
  };
}