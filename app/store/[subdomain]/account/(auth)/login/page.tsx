// src/app/(auth)/login/page.tsx


import { LoginForm } from "@/components/auth/customer/LoginForm";
import { prisma } from "@/lib/prisma";


export default async function LoginPage({params}: {params: {subdomain: string}}) {
  const {subdomain} = await params;
    const shop = await prisma.shop.findUnique({
      where: { subdomain },
    });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href={`/store/${subdomain}/account/signup`} className="text-blue-600 hover:text-blue-500">
              create a new account
            </a>
          </p>
        </div>
        <LoginForm shopId={shop?.id!} />
      </div>
    </div>
  );
}