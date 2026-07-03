

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { LogoUpload } from '@/components/admin/LogoUpload';

import { ThemeSettingsEditor } from '@/theme-settings';
import type { ThemeOverrides , ThemeRow, ThemeSettings } from '@/theme-settings';

export default async function ThemePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const { id } = await params;
  
  if (!session?.user) {
    redirect('/login');
  }

  const shop = await prisma.shop.findUnique({
    where: { id: id },
    include: { theme: {
      select : { id: true, name: true, slug: true, defaultSettings: true }
    }
    },
  });

  if (!shop || shop.userId !== session.user.id) {
    redirect('/dashboard');
  }

  const themes = await prisma.theme.findMany({
    where: { isActive: true },
  });

  async function saveOverrides(overrides: ThemeOverrides) {
     'use server';
     await prisma.shop.update({
       where: { id: id },
       data:  { themeOverrides: overrides },  // only the diff is stored
     });
  }
  // Log shop  and shop.theme for debugging
  console.log('ThemePage shop and theme  :', shop , shop.theme);
  //Log the theme defaultSettings for debugging
  console.log('ThemePage  :', shop.theme?.defaultSettings); 
  //Replace theme defaultSettings's type Json with ThemeSettings type
  const themeRow =  { ...shop.theme, defaultSettings:  shop.theme?.defaultSettings as any  } as ThemeRow;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">{shop.name} - Theme Settings</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <LogoUpload shopId={shop.id} currentLogoUrl={shop.logoUrl} />
        <ThemeSelector shopId={shop.id} themes={themes} currentThemeId={shop.themeId} />
      </div>
      <div className=" mx-auto px-4 py-8 space-y-8">
       <ThemeSettingsEditor
         theme={themeRow}           // provides defaultSettings for diffing + preview badge
         savedOverrides={shop.themeOverrides as ThemeOverrides}  // the diff stored in the DB
         onSave={saveOverrides}
        showPreview                   // show live preview pane
       />
       </div>
    </div>
  );
}