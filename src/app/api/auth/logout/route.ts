import { NextResponse } from 'next/server';

const TOKEN_COOKIE = 'nr_admin_token';

export async function POST() {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(TOKEN_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
    });
    return response;
}
