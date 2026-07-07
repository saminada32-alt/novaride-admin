import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE = 'nr_admin_token';

const PUBLIC_PATHS = ['/login'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
        pathname.startsWith('/api/')
        || pathname.startsWith('/_next/')
        || pathname.startsWith('/favicon')
        || PUBLIC_PATHS.includes(pathname)
    ) {
        return NextResponse.next();
    }

    const token = req.cookies.get(TOKEN_COOKIE)?.value;
    if (!token) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
