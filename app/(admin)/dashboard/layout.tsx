import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireActiveAccess } from '@/lib/access-control';

// This file is just an example of where to put the check — merge it into
// your actual dashboard layout rather than dropping this in verbatim.
//
// Why here and not middleware.ts: Next.js Edge Middleware runs in the Edge
// runtime, which Prisma can't use directly (no Node.js TCP sockets) unless
// you add a driver adapter (Prisma Accelerate, Neon serverless, etc). A
// server component layout runs in the regular Node.js runtime by default,
// so Prisma just works here — and it still gates every page under it.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth_session = await getServerSession(authOptions);
  const user = auth_session?.user;
  if (!user) {
    redirect('/login');
  }

  const access = await requireActiveAccess(user.id);
  if (!access.allowed) {
    redirect('/dashboard/billing?locked=true');
  }

  return <>{children}</>;
}
