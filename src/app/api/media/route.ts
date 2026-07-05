import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:3000';
const TOKEN_COOKIE = 'nr_admin_token';

export async function GET(req: NextRequest) {
    const token =
        req.cookies.get(TOKEN_COOKIE)?.value
        ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
        ?? null;
    const rawPath = req.nextUrl.searchParams.get('path');

    if (!token) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!rawPath || !rawPath.startsWith('/uploads/')) {
        return new NextResponse('Invalid path', { status: 400 });
    }

    let fetchUrl = `${API_URL.replace(/\/$/, '')}${rawPath}`;
    const headers: Record<string, string> = {};

    if (!rawPath.includes('sig=')) {
        try {
            const signRes = await fetch(
                `${API_URL.replace(/\/$/, '')}/uploads/signed-url?path=${encodeURIComponent(rawPath)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                },
            );
            if (signRes.ok) {
                const data = await signRes.json();
                if (data?.url) {
                    fetchUrl = data.url.startsWith('http')
                        ? data.url
                        : `${API_URL.replace(/\/$/, '')}${data.url}`;
                }
            } else {
                headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const upstream = await fetch(fetchUrl, { headers, cache: 'no-store' });
    if (!upstream.ok) {
        return new NextResponse('Not found', { status: upstream.status });
    }

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
        status: 200,
        headers: {
            'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
            'Cache-Control': 'private, max-age=300',
        },
    });
}
