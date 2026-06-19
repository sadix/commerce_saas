// src/app/layout.tsx

import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';


export const metadata: Metadata = {
  title: 'Terms of Use  | BaoBuy',
  description: 'Create your online store in minutes',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <>
     {children}
    </>
  );
}