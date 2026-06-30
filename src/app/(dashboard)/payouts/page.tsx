'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { payoutsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function PayoutsPage() {
    const { isAr } = useI18n();
    const [tab, setTab] = useState<'pending' | 'all' | 'balances'>('pending');
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = tab === 'pending'
                ? await payoutsApi.getPending()
                : tab === 'all'
                    ? await payoutsApi.getAll()
                    : await payoutsApi.getBalances();
            setRows(Array.isArray(res.data) ? res.data : res.data?.items ?? []);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    async function approve(id: number) {
        try {
            await payoutsApi.approve(id);
            toast.success(isAr ? 'تمت الموافقة' : 'Approved');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    async function reject(id: number) {
        const reason = prompt(isAr ? 'سبب الرفض' : 'Rejection reason') ?? '';
        try {
            await payoutsApi.reject(id, reason);
            toast.success(isAr ? 'تم الرفض' : 'Rejected');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    return (
        <>
            <Header title={isAr ? 'المدفوعات للسائقين' : 'Payouts'} />
            <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {(['pending', 'all', 'balances'] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            background: tab === t ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                            color: tab === t ? '#818cf8' : '#71717a', fontSize: 13,
                        }}>
                            {t === 'pending' ? (isAr ? 'معلّقة' : 'Pending') : t === 'all' ? (isAr ? 'الكل' : 'All') : (isAr ? 'الأرصدة' : 'Balances')}
                        </button>
                    ))}
                </div>

                {loading ? <p style={{ color: '#71717a' }}>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ color: '#71717a' }}>
                                <th style={{ padding: 10, textAlign: 'left' }}>ID</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'السائق' : 'Driver'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'المبلغ' : 'Amount'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                                {tab !== 'balances' && <th style={{ padding: 10 }}></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r: any) => (
                                <tr key={r.id ?? r.driverId} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <td style={{ padding: 10, color: '#fff' }}>{r.id ?? r.driverId}</td>
                                    <td style={{ padding: 10, color: '#d4d4d8' }}>
                                        {r.driverName ?? r.driver?.firstName ?? `Driver #${r.driverId}`}
                                    </td>
                                    <td style={{ padding: 10, color: '#fff' }}>{formatCurrency(r.amount ?? r.balance)}</td>
                                    <td style={{ padding: 10, color: '#a1a1aa' }}>{r.status ?? 'balance'}</td>
                                    {tab !== 'balances' && r.status === 'PENDING' && (
                                        <td style={{ padding: 10 }}>
                                            <button onClick={() => approve(r.id)} style={{ marginRight: 8, background: 'rgba(34,197,94,0.15)', border: 'none', color: '#4ade80', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>✓</button>
                                            <button onClick={() => reject(r.id)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>✕</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
