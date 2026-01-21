// src/app/store/[subdomain]/layout.tsx

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CartProvider } from '@/contexts/CartContext';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { CartDrawer } from '@/components/storefront/CartDrawer';

interface StoreProps {
  children: React.ReactNode;
  params: Promise<{ 
    subdomain: string;
  }>;
}

export default async function StorefrontLayout({
  children,
  params,
}: StoreProps) {
  const { subdomain } = await params;
  const shop = await prisma.shop.findUnique({
    where: { subdomain: subdomain },
  });

  if (!shop) {
    notFound();
  }

  return (
    <CustomerAuthProvider shopId={shop.id}>
      <CartProvider shopId={shop.id}>
        {children}
        <CartDrawer />
      </CartProvider>
    </CustomerAuthProvider>
  );
}