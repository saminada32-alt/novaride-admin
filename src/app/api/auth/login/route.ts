import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:3000';
const TOKEN_COOKIE = 'nr_admin_token';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    if (data.mfaRequired) {
        return NextResponse.json(data);
    }

    const response = NextResponse.json({
        admin: data.admin,
        access_token: data.access_token,
        mfaRequired: false,
    });

    response.cookies.set(TOKEN_COOKIE, data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 12,
    });

    return response;
}
