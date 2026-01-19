import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShopSettingsForm } from '@/components/admin/ShopSettingsForm';

export default async function SettingsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
  if (!session?.user) {
    redirect('/login');
  }

  const shop = await prisma.shop.findUnique({
    where: { id: id },
  });

  if (!shop || shop.userId !== session.user.id) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">{shop.name} - Settings</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ShopSettingsForm shop={shop} />
      </div>
    </div>
  );
}