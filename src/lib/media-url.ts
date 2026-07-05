const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/** Build a full URL for API upload paths (including signed query params). */
export function mediaUrl(path?: string | null): string | null {
    if (!path || path === 'undefined' || path === 'null') return null;
    if (path.startsWith('http')) return path;
    const base = API_BASE.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Normalize upload path for the admin media proxy (`/api/media?path=...`). */
export function mediaProxyPath(path?: string | null): string | null {
    if (!path || path === 'undefined' || path === 'null') return null;
    if (path.startsWith('http')) {
        try {
            const u = new URL(path);
            if (!u.pathname.startsWith('/uploads/')) return null;
            return u.pathname + u.search;
        } catch {
            return null;
        }
    }
    return path.startsWith('/') ? path : `/${path}`;
}
