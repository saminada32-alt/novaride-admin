import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:3000';
const TOKEN_COOKIE = 'nr_admin_token';

async function proxy(req: NextRequest, slug: string[]) {
    const token = req.cookies.get(TOKEN_COOKIE)?.value;
    const path = slug.join('/');
    const url = new URL(`${API_URL}/${path}`);
    req.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    const headers = new Headers();
    const contentType = req.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
        headers.set('Authorization', authHeader);
    } else if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const init: RequestInit = {
        method: req.method,
        headers,
        cache: 'no-store',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        init.body = await req.arrayBuffer();
    }

    const upstream = await fetch(url.toString(), init);
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
        status: upstream.status,
        headers: {
            'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        },
    });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return proxy(req, path);
}
