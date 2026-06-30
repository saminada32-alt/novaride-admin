'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { useI18n } from '@/lib/i18n';
import { useMarket } from '@/lib/market-context';
import { opsApi, type OpsPendingPayment } from '@/lib/api';

const POLL_MS = 15000;

function personName(
    p: { firstName?: string; lastName?: string } | null | undefined,
) {
    if (!p) return '—';
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || '—';
}

export default function ShamCashQueuePage() {
    const { isAr } = useI18n();
    const { marketCode } = useMarket();
    const [rows, setRows] = useState<OpsPendingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await opsApi.pendingPayments(marketCode);
            setRows(Array.isArray(res.data) ? res.data : []);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? 'Failed to load queue');
        } finally {
            setLoading(false);
        }
    }, [marketCode]);

    useEffect(() => {
        setLoading(true);
        void load();
        const timer = setInterval(() => { void load(); }, POLL_MS);
        return () => clearInterval(timer);
    }, [load]);

    async function confirm(rideId: number) {
        setConfirming(rideId);
        try {
            await opsApi.confirmPayment(rideId);
            toast.success(isAr ? 'تم تأكيد الدفع' : 'Payment confirmed');
            await load();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? 'Failed');
        } finally {
            setConfirming(null);
        }
    }

    return (
        <>
            <Header
                title={isAr ? 'طابور شام كاش' : 'Sham Cash Queue'}
                subtitle={isAr
                    ? 'رحلات مكتملة بانتظار تأكيد التحويل'
                    : 'Completed rides awaiting transfer confirmation'}
            />
            <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
                <p style={{ color: '#71717a', fontSize: 13, marginBottom: 16 }}>
                    {isAr
                        ? `${rows.length} رحلة بانتظار التأكيد`
                        : `${rows.length} ride(s) pending confirmation`}
                </p>

                {loading ? (
                    <p style={{ color: '#71717a' }}>Loading...</p>
                ) : rows.length === 0 ? (
                    <p style={{ color: '#52525b' }}>
                        {isAr ? 'لا توجد مدفوعات معلّقة' : 'No pending payments'}
                    </p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ color: '#71717a' }}>
                                <th style={{ padding: 10, textAlign: 'left' }}>#</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>
                                    {isAr ? 'الراكب' : 'Passenger'}
                                </th>
                                <th style={{ padding: 10, textAlign: 'left' }}>
                                    {isAr ? 'السائق' : 'Driver'}
                                </th>
                                <th style={{ padding: 10, textAlign: 'left' }}>
                                    {isAr ? 'المبلغ' : 'Amount'}
                                </th>
                                <th style={{ padding: 10, textAlign: 'left' }}>
                                    {isAr ? 'المرجع' : 'Reference'}
                                </th>
                                <th style={{ padding: 10, textAlign: 'left' }}>
                                    {isAr ? 'السوق' : 'Market'}
                                </th>
                                <th style={{ padding: 10 }} />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr
                                    key={r.id}
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    <td style={{ padding: 10 }}>
                                        <Link href={`/rides/${r.id}`} style={{ color: '#818cf8' }}>
                                            #{r.id}
                                        </Link>
                                    </td>
                                    <td style={{ padding: 10, color: '#d4d4d8' }}>
                                        {personName(r.passenger)}
                                        {r.passenger?.phone ? (
                                            <span style={{ color: '#71717a', marginLeft: 6 }}>
                                                {r.passenger.phone}
                                            </span>
                                        ) : null}
                                    </td>
                                    <td style={{ padding: 10, color: '#d4d4d8' }}>
                                        {personName(r.driver)}
                                    </td>
                                    <td style={{ padding: 10, color: '#fbbf24' }}>
                                        {(r.finalFare ?? r.estimatedFare ?? 0).toLocaleString()} ل.س
                                    </td>
                                    <td style={{ padding: 10, fontFamily: 'monospace', color: '#a1a1aa' }}>
                                        {r.paymentReference ?? '—'}
                                    </td>
                                    <td style={{ padding: 10, color: '#71717a' }}>
                                        {r.marketCode ?? '—'}
                                    </td>
                                    <td style={{ padding: 10 }}>
                                        <button
                                            disabled={confirming === r.id}
                                            onClick={() => confirm(r.id)}
                                            style={{
                                                background: 'rgba(34,197,94,0.15)',
                                                border: 'none',
                                                color: '#4ade80',
                                                padding: '6px 12px',
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                                fontSize: 12,
                                            }}
                                        >
                                            {confirming === r.id
                                                ? '...'
                                                : (isAr ? 'تأكيد' : 'Confirm')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
