// src/app/(auth)/signup/page.tsx

import { prisma } from '@/lib/prisma';
import { SignupForm } from '@/components/auth/customer/SignupForm';


export default async function SignupPage({ params }: { params: { subdomain: string } }) {
  const {subdomain} = await params;
  const shop = await prisma.shop.findUnique({
    where: { subdomain },
  });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
        <SignupForm shopId={shop?.id!} />
      </div>
    </div>
  );
}