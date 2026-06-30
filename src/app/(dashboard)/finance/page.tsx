'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { financeApi, ledgerApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function FinancePage() {
    const { isAr } = useI18n();
    const [days, setDays] = useState(7);
    const [summary, setSummary] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [ledger, setLedger] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const to = new Date().toISOString();
        const from = new Date(Date.now() - days * 86400000).toISOString();
        try {
            const [s, i, l] = await Promise.all([
                financeApi.getSummary(from, to),
                financeApi.getItems(from, to),
                ledgerApi.getSummary(),
            ]);
            setSummary(s.data);
            setItems(Array.isArray(i.data) ? i.data : i.data?.items ?? []);
            setLedger(l.data);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed to load finance');
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => { load(); }, [load]);

    async function matchRide(rideId: number) {
        try {
            await financeApi.matchRide(rideId);
            toast.success(isAr ? 'تمت المطابقة' : 'Matched');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Match failed');
        }
    }

    const cards = summary ? [
        { label: isAr ? 'إيراد الرحلات' : 'Ride Revenue', value: summary.rides?.revenue ?? summary.rideRevenue },
        { label: isAr ? 'Sham Cash معلّق' : 'Sham Cash Pending', value: summary.rides?.shamCashPending ?? summary.shamCash?.pendingAmount },
        { label: isAr ? 'مدفوعات معلّقة' : 'Payouts Pending', value: summary.payouts?.pendingAmount ?? summary.payouts?.pendingTotal },
        { label: isAr ? 'التباين' : 'Variance', value: summary.variance },
    ] : [];

    return (
        <>
            <Header title={isAr ? 'المالية' : 'Finance'} />
            <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                        {isAr ? 'التسوية والمحاسبة' : 'Reconciliation & Ledger'}
                    </h2>
                    <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e4e4e7', borderRadius: 8, padding: '6px 12px',
                    }}>
                        <option value={7}>7 {isAr ? 'أيام' : 'days'}</option>
                        <option value={30}>30 {isAr ? 'أيام' : 'days'}</option>
                    </select>
                </div>

                {loading ? <p style={{ color: '#71717a' }}>Loading...</p> : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 24 }}>
                            {cards.map((c) => (
                                <div key={c.label} style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 12, padding: 16,
                                }}>
                                    <p style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>{c.label}</p>
                                    <p style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{formatCurrency(c.value ?? 0)}</p>
                                </div>
                            ))}
                        </div>

                        {ledger && (
                            <div style={{ marginBottom: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 8 }}>LEDGER ACCOUNTS</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                    {Object.entries(ledger.accounts ?? ledger).map(([k, v]: any) => (
                                        <span key={k} style={{ fontSize: 13, color: '#d4d4d8' }}>
                                            {k}: <strong>{formatCurrency(typeof v === 'object' ? v.balance : v)}</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ color: '#71717a', textAlign: 'left' }}>
                                    <th style={{ padding: 10 }}>Ride</th>
                                    <th style={{ padding: 10 }}>Fare</th>
                                    <th style={{ padding: 10 }}>Method</th>
                                    <th style={{ padding: 10 }}>Status</th>
                                    <th style={{ padding: 10 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(items) ? items : []).map((row: any) => {
                                    const rideId = row.rideId ?? row.id;
                                    const reconciled = row.reconciled ?? row.matched;
                                    return (
                                    <tr key={rideId} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={{ padding: 10 }}>
                                            <Link href={`/rides/${rideId}`} style={{ color: '#818cf8' }}>
                                                #{rideId}
                                            </Link>
                                        </td>
                                        <td style={{ padding: 10, color: '#fff' }}>{formatCurrency(row.amount ?? row.fare ?? row.finalFare)}</td>
                                        <td style={{ padding: 10, color: '#a1a1aa' }}>{row.paymentMethod ?? '—'}</td>
                                        <td style={{ padding: 10, color: reconciled ? '#4ade80' : '#fbbf24' }}>
                                            {reconciled ? 'Matched' : row.issue ?? row.status ?? 'Pending'}
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            {!reconciled && (
                                                <button onClick={() => matchRide(rideId)} style={{
                                                    background: 'rgba(99,102,241,0.2)', border: 'none', color: '#818cf8',
                                                    padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                                                }}>Match</button>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </>
    );
}
