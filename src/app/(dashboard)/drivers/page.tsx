'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { useDrivers } from '@/hooks/useDrivers';
import { driversApi } from '@/lib/api';
import { approveDriverFull } from '@/lib/approve-driver';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { panel } from '@/lib/panel-styles';
import type { Driver } from '@/lib/types';

const STATUS = {
    online: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    offline: { bg: 'rgba(113,113,122,0.12)', color: '#a1a1aa' },
    on_trip: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
};

const APPROVAL = {
    APPROVED: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    PENDING: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
    REJECTED: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

export default function DriversPage() {
    const router = useRouter();
    const { t, isAr } = useI18n();

    const [tab, setTab] = useState<'' | 'approved' | 'pending' | 'rejected'>('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get('tab');
        if (q === 'approved' || q === 'pending' || q === 'rejected') {
            setTab(q);
        }
    }, []);

    const { drivers, loading, refetch } = useDrivers(tab || undefined);

    const PAGE_SIZE = 12;

    const filtered = drivers.filter(d => {
        const q = search.toLowerCase();
        return (
            !search ||
            d.phone.includes(q) ||
            d.firstName?.toLowerCase().includes(q) ||
            d.lastName?.toLowerCase().includes(q)
        );
    });

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function apiErrorMessage(e: unknown): string {
        const err = e as { response?: { data?: { message?: string | string[] } }; message?: string };
        const msg = err?.response?.data?.message ?? err?.message ?? 'Failed';
        return Array.isArray(msg) ? msg.join(', ') : String(msg);
    }

    async function approve(id: number) {
        try {
            await approveDriverFull(id);
            toast.success(isAr ? 'تم قبول السائق' : 'Driver approved');
            refetch();
        } catch (e) {
            toast.error(apiErrorMessage(e));
        }
    }

    async function reject(id: number) {
        try {
            await driversApi.reject(id, 'Rejected by admin');
            toast.success(isAr ? 'تم الرفض' : 'Rejected');
            refetch();
        } catch (e) {
            toast.error(apiErrorMessage(e));
        }
    }

    return (
        <>
            <Header />

            <div style={{ ...panel.page, padding: '34px 40px' }}>
                <div style={{ marginBottom: 26 }}>
                    <h1 style={{
                        fontSize: 34,
                        fontWeight: 900,
                        letterSpacing: 1,
                        color: 'var(--text-1)',
                    }}>
                        DRIVERS
                    </h1>

                    <p style={{ marginTop: 6, fontSize: 14, ...panel.textMuted }}>
                        {isAr ? 'كل السائقين المسجّلين في النظام' : 'All registered drivers in the system'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                        { key: '' as const, label: t.all },
                        { key: 'approved' as const, label: t.approved },
                        { key: 'pending' as const, label: t.pending },
                        { key: 'rejected' as const, label: t.rejected },
                    ].map((f) => (
                        <button
                            key={f.key || 'all'}
                            onClick={() => { setTab(f.key); setPage(1); }}
                            style={panel.tab(tab === f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search drivers..."
                    style={{
                        width: 320,
                        height: 42,
                        padding: '0 14px',
                        borderRadius: 12,
                        marginBottom: 20,
                        ...panel.input,
                    }}
                />

                <div style={{
                    borderRadius: 18,
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)',
                }}>
                    {loading ? (
                        <div style={{ padding: 40, ...panel.textMuted }}>Loading...</div>
                    ) : paginated.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', ...panel.textMuted }}>
                            {isAr ? 'لا يوجد سائقين' : 'No drivers found'}
                        </div>
                    ) : (
                        paginated.map(d => {
                            const apKey =
                                d.isApproved ? 'APPROVED' :
                                    d.isRejected ? 'REJECTED' : 'PENDING';

                            const ap = APPROVAL[apKey];
                            const st = STATUS[d.status] || STATUS.offline;

                            return (
                                <div
                                    key={d.id}
                                    onClick={() => router.push(`/drivers/${d.id}`)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 260px',
                                        padding: '16px 18px',
                                        ...panel.rowDivider,
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, ...panel.text }}>
                                            {(d.firstName || d.lastName)
                                                ? `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()
                                                : (isAr ? 'بدون اسم' : 'No name')}
                                        </div>
                                        <div style={{ fontSize: 12, ...panel.textMuted }}>
                                            {d.phone}
                                        </div>
                                    </div>

                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: 20,
                                        background: st.bg,
                                        color: st.color,
                                        fontSize: 12,
                                        width: 'fit-content'
                                    }}>
                                        {d.status}
                                    </span>

                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: 20,
                                        background: ap.bg,
                                        color: ap.color,
                                        fontSize: 12,
                                        width: 'fit-content'
                                    }}>
                                        {apKey}
                                    </span>

                                    <span style={{ color: '#fbbf24' }}>
                                        ⭐ {Number(d.rating).toFixed(1)}
                                    </span>

                                    <span style={{ ...panel.textMuted, fontSize: 12 }}>
                                        {formatDate(d.createdAt)}
                                    </span>

                                    <div
                                        onClick={e => e.stopPropagation()}
                                        style={{ display: 'flex', gap: 10 }}
                                    >
                                        <button
                                            onClick={() => approve(d.id)}
                                            disabled={d.isApproved}
                                            style={{
                                                flex: 1,
                                                height: 42,
                                                borderRadius: 12,
                                                fontSize: 13,
                                                fontWeight: 800,
                                                background: d.isApproved
                                                    ? 'rgba(34,197,94,0.08)'
                                                    : 'rgba(34,197,94,0.25)',
                                                border: '1px solid rgba(34,197,94,0.4)',
                                                color: '#22c55e',
                                                cursor: d.isApproved ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            ✔ Approve
                                        </button>

                                        <button
                                            onClick={() => reject(d.id)}
                                            disabled={d.isRejected}
                                            style={{
                                                flex: 1,
                                                height: 42,
                                                borderRadius: 12,
                                                fontSize: 13,
                                                fontWeight: 800,
                                                background: d.isRejected
                                                    ? 'rgba(239,68,68,0.08)'
                                                    : 'rgba(239,68,68,0.25)',
                                                border: '1px solid rgba(239,68,68,0.4)',
                                                color: '#ef4444',
                                                cursor: d.isRejected ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            ✖ Reject
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={{ marginTop: 20 }}>
                    <Pagination
                        page={page}
                        total={filtered.length}
                        pageSize={PAGE_SIZE}
                        onChange={setPage}
                    />
                </div>
            </div>
        </>
    );
}
