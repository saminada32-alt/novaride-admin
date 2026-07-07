import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE = 'nr_admin_token';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(TOKEN_COOKIE)?.value;
    return NextResponse.json({ authenticated: Boolean(token) });
}
