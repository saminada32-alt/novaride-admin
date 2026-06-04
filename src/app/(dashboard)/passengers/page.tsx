'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { passengersApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

type PassengerRow = {
    id: number;
    phone: string;
    firstName?: string;
    lastName?: string;
    ridesCount?: number;
    walletBalance?: number;
    isActive: boolean;
    createdAt: string;
};

export default function PassengersPage() {
    const [data, setData] = useState<{ data: PassengerRow[]; total: number } | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isAr } = useI18n();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await passengersApi.getAll({ page, limit: 20, search: search || undefined });
            setData(res.data);
        } catch {
            toast.error(isAr ? 'فشل تحميل الركاب' : 'Failed to load passengers');
        } finally {
            setLoading(false);
        }
    }, [page, search, isAr]);

    useEffect(() => { load(); }, [load]);
    useRealtimeUpdates(load);

    const toggleBlock = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await passengersApi.toggleBlock(id);
            load();
        } catch {
            toast.error(isAr ? 'فشل التحديث' : 'Update failed');
        }
    };

    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 20));

    return (
        <>
            <Header title={isAr ? 'الركاب' : 'Passengers'} />
            <div style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
                            {isAr ? 'الركاب' : 'Passengers'}
                        </h2>
                        <p style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>
                            {data?.total ?? 0} {isAr ? 'إجمالي' : 'total'}
                        </p>
                    </div>
                </div>

                <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder={isAr ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
                    style={{
                        width: '100%', maxWidth: 420, marginBottom: 16,
                        padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#e4e4e7', fontSize: 13, outline: 'none',
                    }}
                />

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, overflow: 'hidden',
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#71717a' }}>
                                {(isAr
                                    ? ['#', 'الاسم', 'الهاتف', 'الرحلات', 'المحفظة', 'الحالة', 'انضم', 'إجراء']
                                    : ['#', 'Name', 'Phone', 'Rides', 'Wallet', 'Status', 'Joined', 'Action']
                                ).map((h) => (
                                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#71717a' }}>
                                        {isAr ? 'جاري التحميل...' : 'Loading...'}
                                    </td>
                                </tr>
                            ) : (data?.data ?? []).map((p) => (
                                <tr
                                    key={p.id}
                                    onClick={() => router.push(`/passengers/${p.id}`)}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                                >
                                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#71717a' }}>#{p.id}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#e4e4e7' }}>
                                        {p.firstName || p.lastName
                                            ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
                                            : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, color: '#a1a1aa' }}>{p.phone}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>{p.ridesCount ?? 0}</td>
                                    <td style={{ padding: '12px 16px', color: '#4ade80', fontWeight: 700 }}>
                                        {formatCurrency(Number(p.walletBalance ?? 0))}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                            background: p.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: p.isActive ? '#4ade80' : '#f87171',
                                        }}>
                                            {p.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'محظور' : 'Blocked')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#71717a' }}>
                                        {new Date(p.createdAt).toLocaleDateString(isAr ? 'ar-SY' : 'en-US')}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button
                                            onClick={(e) => toggleBlock(p.id, e)}
                                            style={{
                                                padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                                                border: 'none', cursor: 'pointer',
                                                background: p.isActive ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                                                color: p.isActive ? '#f87171' : '#4ade80',
                                            }}
                                        >
                                            {p.isActive ? (isAr ? 'حظر' : 'Block') : (isAr ? 'إلغاء الحظر' : 'Unblock')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            style={{
                                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                background: 'rgba(255,255,255,0.05)', border: 'none',
                                color: page === 1 ? '#52525b' : '#e4e4e7', cursor: page === 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isAr ? 'السابق' : 'Previous'}
                        </button>
                        <span style={{ fontSize: 12, color: '#71717a' }}>
                            {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            style={{
                                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                background: 'rgba(255,255,255,0.05)', border: 'none',
                                color: page >= totalPages ? '#52525b' : '#e4e4e7',
                                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isAr ? 'التالي' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
