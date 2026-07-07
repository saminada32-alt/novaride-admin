import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:3000';
const TOKEN_COOKIE = 'nr_admin_token';

function apiOrigin(): string {
    return API_URL.replace(/\/$/, '');
}

/** Strip expired signed-URL query — admin Bearer auth is authoritative. */
function bareUploadPath(rawPath: string): string {
    const noQuery = rawPath.split('?')[0] ?? rawPath;
    return noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
}

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

    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
    };

    const barePath = bareUploadPath(rawPath);
    let fetchUrl = `${apiOrigin()}${barePath}`;

    // Prefer a fresh signed URL when available (browser cache-friendly).
    try {
        const signRes = await fetch(
            `${apiOrigin()}/uploads/signed-url?path=${encodeURIComponent(barePath)}`,
            { headers, cache: 'no-store' },
        );
        if (signRes.ok) {
            const data = await signRes.json();
            const signed = data?.url as string | undefined;
            if (signed) {
                fetchUrl = signed.startsWith('http')
                    ? signed
                    : `${apiOrigin()}${signed.startsWith('/') ? signed : `/${signed}`}`;
            }
        }
    } catch {
        // Bearer-only fetch below.
    }

    let upstream = await fetch(fetchUrl, { headers, cache: 'no-store' });

    // Expired sig or signing miss — retry with Bearer on the canonical path.
    if (!upstream.ok) {
        upstream = await fetch(`${apiOrigin()}${barePath}`, { headers, cache: 'no-store' });
    }

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
