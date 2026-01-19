

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { LogoUpload } from '@/components/admin/LogoUpload';

export default async function ThemePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const { id } = await params;
  
  if (!session?.user) {
    redirect('/login');
  }

  const shop = await prisma.shop.findUnique({
    where: { id: id },
    include: { theme: true },
  });

  if (!shop || shop.userId !== session.user.id) {
    redirect('/dashboard');
  }

  const themes = await prisma.theme.findMany({
    where: { isActive: true },
  });

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
    </div>
  );
}