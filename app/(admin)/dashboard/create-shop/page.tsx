// src/app/(admin)/dashboard/create-shop/page.tsx

import { CreateShopForm } from '@/components/admin/CreateShopForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon  } from 'lucide-react';

export default async function CreateShopPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Create New Store</h1>
          <div className="ml-auto">
            <Link
              href="/dashboard"
              className="text-blue-500 hover:text-blue-700"
            >
              <ArrowLeftIcon className="inline mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <CreateShopForm />
      </div>
    </div>
  );
}