'useclient';
import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {User} from 'lucide-react';
//import {useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function LandingLinks() {
    const session = await getServerSession(authOptions);
    const t = await getTranslations('landing.nav');

    if (session?.user) {   
        return (
            <div className="flex gap-4">
                <Link
                    href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-1"
            >  <User className="w-5 h-5 text-gray-700" />
                {t('dashboard')}
            </Link>
            <Link
                href="/api/auth/signout"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                {t('sign_out')}
            </Link>
            </div>
        );
    }
    return (
        <div className="flex gap-4">
            <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
                {t('sign_in')}
            </Link>
            <Link
                href="/signup"
                className="bg-[#F68B1E] hover:bg-[#e07c18] text-white px-6 py-3 rounded-2xl"
            >
                {t('get_started')}
            </Link>
        </div>
    );
}