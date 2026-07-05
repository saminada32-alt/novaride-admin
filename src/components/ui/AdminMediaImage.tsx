'use client';

import { useState } from 'react';
import { mediaProxyPath } from '@/lib/media-url';

type Props = {
    path?: string | null;
    alt?: string;
    width?: number | string;
    height?: number | string;
    style?: React.CSSProperties;
    className?: string;
};

export function AdminMediaImage({ path, alt = '', width, height, style, className }: Props) {
    const [failed, setFailed] = useState(false);

    const proxyPath = mediaProxyPath(path);
    if (!proxyPath || failed) {
        return (
            <div
                className={className}
                style={{
                    width: width ?? '100%',
                    height: height ?? '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-hover, rgba(255,255,255,0.04))',
                    color: 'var(--text-4, #52525b)',
                    fontSize: 10,
                    ...style,
                }}
            >
                —
            </div>
        );
    }

    const src = `/api/media?path=${encodeURIComponent(proxyPath)}`;

    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={() => setFailed(true)}
            style={{ objectFit: 'cover', display: 'block', ...style }}
        />
    );
}

/** Full-size URL for opening in a new tab or lightbox. */
export function adminMediaSrc(path?: string | null): string | null {
    const proxyPath = mediaProxyPath(path);
    return proxyPath ? `/api/media?path=${encodeURIComponent(proxyPath)}` : null;
}
