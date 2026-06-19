// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BaoBuy | eCommerce Platform',
  description: 'Create your online store in minutes',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <html >
      <NextIntlClientProvider  >
        <body className={inter.className}>{children}</body>
      </NextIntlClientProvider>
      
    </html>
  );
}