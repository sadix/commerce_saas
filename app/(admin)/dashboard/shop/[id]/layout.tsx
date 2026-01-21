import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShopSidebar } from '@/components/admin/ShopSidebar';



interface ParamProps {
  params: Promise<{ 
    id: string;
  }>;
}

interface ShopProps {
  children: React.ReactNode;
  params: Promise<{ 
    id: string;
  }>;
}

export default async function ShopLayout({
  children,
  params,
}: ShopProps) {
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
            <p className="text-sm text-gray-500">{shop.subdomain}.yourdomain.com</p>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </a>
        </div>
      </nav>

      <div className="flex">
        <ShopSidebar shopId={id} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}