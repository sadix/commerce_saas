'useclient';
import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {User} from 'lucide-react'

export async function LandingLinks() {
    const session = await getServerSession(authOptions);

    if (session?.user) {   
        return (
            <div className="flex gap-4">
                <Link
                    href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-1"
            >  <User className="w-5 h-5 text-gray-700" />
                Dashboard
            </Link>
            <Link
                href="/api/auth/signout"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Sign Out
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
                Sign In
            </Link>
            <Link
                href="/signup"
                className="bg-[#F68B1E] hover:bg-[#e07c18] text-white px-6 py-3 rounded-2xl"
            >
                Get Started
            </Link>
        </div>
    );
}