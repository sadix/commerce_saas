// src/app/store/[subdomain]/layout.tsx

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CartProvider } from '@/contexts/CartContext';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { ThemeStyleTag, ThemeSettingsProvider, ShopThemeFields } from '@/theme-settings';

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
    include : {
      theme:true,
    }
  });

  if (!shop) {
    notFound();
  }

  return (
    <CustomerAuthProvider shopId={shop.id}>
      <CartProvider shopId={shop.id}>
        <ThemeStyleTag shop={shop as ShopThemeFields} />
        <ThemeSettingsProvider shop={shop as ShopThemeFields}>
          {children}
          <CartDrawer />
        </ThemeSettingsProvider>
      </CartProvider>
    </CustomerAuthProvider>
  );
}
     
 