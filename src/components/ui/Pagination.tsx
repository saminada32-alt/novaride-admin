'use client';

import { useI18n } from '@/lib/i18n';

interface PaginationProps {
    page: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
    const { isAr } = useI18n();
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visible = pages.filter(p =>
        p === 1 || p === totalPages ||
        (p >= page - 1 && p <= page + 1)
    );

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
            <span style={{ fontSize: '12px', color: '#52525b' }}>
                {isAr
                    ? `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} من ${total}`
                    : `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} of ${total}`}
            </span>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <PageBtn
                    label={isAr ? '←' : '←'}
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                />

                {visible.map((p, i) => {
                    const prev = visible[i - 1];
                    const showDots = prev && p - prev > 1;
                    return (
                        <span key={p}>
                            {showDots && (
                                <span style={{ color: '#3f3f46', padding: '0 4px', fontSize: '12px' }}>…</span>
                            )}
                            <PageBtn
                                label={String(p)}
                                active={p === page}
                                onClick={() => onChange(p)}
                            />
                        </span>
                    );
                })}

                <PageBtn
                    label={isAr ? '→' : '→'}
                    disabled={page === totalPages}
                    onClick={() => onChange(page + 1)}
                />
            </div>
        </div>
    );
}

function PageBtn({ label, active, disabled, onClick }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                minWidth: '30px', height: '30px',
                padding: '0 8px', borderRadius: '7px',
                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                color: active ? '#818cf8' : disabled ? '#3f3f46' : '#71717a',
                fontSize: '12px', fontWeight: active ? '600' : '400',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
                if (!active && !disabled)
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={e => {
                if (!active)
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
        >
            {label}
        </button>
    );
}