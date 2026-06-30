'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { kycApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

const TABS = ['pending', 'in_review', 'approved', 'rejected', 'all'] as const;

export default function KycPage() {
    const { isAr } = useI18n();
    const [tab, setTab] = useState<string>('pending');
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await kycApi.getQueue(tab === 'all' ? undefined : tab);
            setRows(Array.isArray(res.data) ? res.data : res.data?.items ?? []);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    async function approve(driverId: number) {
        try {
            await kycApi.approve(driverId);
            toast.success(isAr ? 'تمت الموافقة' : 'Approved');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    async function reject(driverId: number) {
        const reason = prompt(isAr ? 'سبب الرفض' : 'Reason') ?? '';
        try {
            await kycApi.reject(driverId, reason);
            toast.success(isAr ? 'تم الرفض' : 'Rejected');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    return (
        <>
            <Header title={isAr ? 'طابور KYC' : 'KYC Queue'} />
            <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                    {TABS.map((t) => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            background: tab === t ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                            color: tab === t ? '#818cf8' : '#71717a', fontSize: 13, textTransform: 'capitalize',
                        }}>{t.replace('_', ' ')}</button>
                    ))}
                </div>

                {loading ? <p style={{ color: '#71717a' }}>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ color: '#71717a' }}>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'السائق' : 'Driver'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>Phone</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>KYC Status</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>Vendor</th>
                                <th style={{ padding: 10 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r: any) => {
                                const driverId = r.driverId ?? r.driver?.id ?? r.id;
                                const firstName = r.driver?.firstName ?? r.firstName ?? '';
                                const lastName = r.driver?.lastName ?? r.lastName ?? '';
                                const phone = r.driver?.phone ?? r.phone;
                                return (
                                <tr key={driverId} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <td style={{ padding: 10 }}>
                                        <Link href={`/drivers/${driverId}`} style={{ color: '#818cf8' }}>
                                            {firstName} {lastName} #{driverId}
                                        </Link>
                                    </td>
                                    <td style={{ padding: 10, color: '#d4d4d8' }}>{phone ?? '—'}</td>
                                    <td style={{ padding: 10, color: '#fbbf24' }}>{r.kycStatus ?? r.status}</td>
                                    <td style={{ padding: 10, color: '#a1a1aa' }}>{r.kycProviderRef ?? r.vendor ?? r.provider ?? '—'}</td>
                                    <td style={{ padding: 10 }}>
                                        {['pending', 'in_review'].includes(r.kycStatus ?? r.status) && (
                                            <>
                                                <button onClick={() => approve(driverId)} style={{ marginRight: 8, background: 'rgba(34,197,94,0.15)', border: 'none', color: '#4ade80', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>✓</button>
                                                <button onClick={() => reject(driverId)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>✕</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
