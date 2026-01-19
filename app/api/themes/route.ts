import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const themes = await prisma.theme.findMany({
    where: { isActive: true },
  });

  return NextResponse.json(themes);
}