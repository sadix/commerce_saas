import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {Shop, Theme} from '@prisma/client';
import { Store, FileText, LayoutDashboard  } from 'lucide-react';
import { rootDomain,  } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { AccountEditModal } from '@/components/admin/AccountEditModal';
import  Image  from 'next/image' ;
import { ArrowLeftIcon  } from 'lucide-react';

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Globe,
} from "lucide-react";

export default async function AccountPage(){
    const session = await getServerSession(authOptions);
      const t = await getTranslations('admin.dashboard');
      
      if (!session?.user) {
        redirect('/login');
      }

    //GET user infos and account details from the database
    const userAccount = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        accounts: true,
        sessions: true,
      }
    });

    const user = {
    name: userAccount?.name || '',
    email: userAccount?.email ||'',
    phone: " N/A",
    location: "N/A",
    website: "N/A",
    joinedAt: userAccount?.created_at.toLocaleDateString() || "N/A",
    bio: "Passionate entrepreneur and software developer focused on building scalable web applications and digital products.",
    avatar: userAccount?.image || `https://api.dicebear.com/10.x/initials/svg?seed=${userAccount?.name}`,
    stats: {
      shops: 24,
      products: 157,
      orders: 89,
    },
  };

  // get user activity from the database
  const userActivity = await prisma.activityLog.findMany({
    where: { userId: userAccount?.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Profile Header */}
        <div className="overflow-hidden rounded-3xl bg-white  shadow-sm dark:bg-gray-900">
          <div className="h-10 " />

          <div className="relative px-8 pb-8">
            <div className="-mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col items-center gap-5 md:flex-row">
                
                <Image src={user.avatar } alt={user.name} className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg" height={500} width={500} />

                <div className="text-center md:text-left ml-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h1>

                  
                </div>
              </div>
              <div className="ml-auto">
              <Link
                href="/dashboard"
                className="inline-flex px-2 py-3 bg-gray-300 text-black rounded hover:bg-blue-700"
              >
                <ArrowLeftIcon />
                Back to Dashboard
              </Link>
              </div>
              <AccountEditModal userId={session.user.id}></AccountEditModal>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-1">
            {/* Personal Info */}
            <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>

              <div className="space-y-5">
                <InfoItem
                  icon={<Mail size={18} />}
                  label="Email"
                  value={user.email}
                />

                <InfoItem
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={user.phone}
                />

                <InfoItem
                  icon={<MapPin size={18} />}
                  label="Location"
                  value={user.location}
                />

                <InfoItem
                  icon={<Globe size={18} />}
                  label="Website"
                  value={user.website}
                />

                <InfoItem
                  icon={<Calendar size={18} />}
                  label="Joined"
                  value={user.joinedAt}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                Statistics
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  label="Shops"
                  value={user.stats.shops}
                />

                <StatCard
                  label="Orders"
                  value={user.stats.orders}
                />

                <StatCard
                  label="Reviews"
                  value={user.stats.products}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Activity */}
            <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>

              <div className="space-y-5">
                
                
               { userActivity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    title={activity.action}
                    date={activity.createdAt.toLocaleString()}
                    details={activity.details ? activity.details : undefined}
                  />
                ))}
              </div>
            </div>

            {/* About */}
            <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                About
              </h2>

              <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                {user.bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-lg bg-gray-100 p-2 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </p>

        <p className="font-medium text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 text-center dark:border-gray-800">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {label}
      </p>
    </div>
  );
}

function ActivityItem({
  title,
  date,
  details
}: {
  title: string;
  date: string;
  details?: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-dotted border-gray-100">
      <div className="h-3 w-3 rounded-full bg-green-500" />

      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">
          {title}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {date}
        </p>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        
      </div>
    </div>
  );
}