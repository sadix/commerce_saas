// src/app/api/shops/[shopId]/theme-settings/route.ts
// GET  — returns the shop's themeOverrides (the tenant's saved changes only)
// PUT  — saves new themeOverrides (diff only — not the full ThemeSettings)

import { NextRequest, NextResponse } from 'next/server';
import type { ThemeOverrides } from '@/types/theme-settings';
import { logActivity } from '@/lib/activity-logger';

interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    id: string;
  }>;
}

// ─── GET /api/shops/[shopId]/theme-settings ───────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: ReqParamProps
) {
  try {
    // const shop = await db.shop.findUnique({
    //   where:  { id: params.shopId },
    //   select: {
    //     themeOverrides: true,
    //     theme: {
    //       select: { id: true, slug: true, name: true, defaultSettings: true },
    //     },
    //   },
    // });

    // if (!shop) {
    //   return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    // }

    // return NextResponse.json({
    //   theme:          shop.theme,
    //   themeOverrides: shop.themeOverrides ?? {},
    // });

    //console.log('GET theme-settings for shop:', params.shopId);
    return NextResponse.json({ theme: null, themeOverrides: {} });
  } catch (err) {
    console.error('GET theme-settings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PUT /api/shops/[shopId]/theme-settings ───────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: ReqParamProps
) {
  try {
    const body: ThemeOverrides = await request.json();

    if (typeof body !== 'object' || Array.isArray(body) || body === null) {
      return NextResponse.json({ error: 'Body must be a ThemeOverrides object' }, { status: 400 });
    }

    // The body is a minimal diff — only the tokens the tenant changed.
    // Store it directly; resolveThemeSettings() merges it at read time.

    // await db.shop.update({
    //   where: { id: params.shopId },
    //   data:  { themeOverrides: body },
    // });

    logActivity('Theme Settings Updated', 'system', { shopId: (await params).id, changes: body }, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "unknown ip address");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT theme-settings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}