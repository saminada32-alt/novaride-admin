'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { walletApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

type TopupRequest = {
    id: number;
    driverId: number;
    amount: number;
    method: 'bank' | 'cash';
    reference?: string;
    note?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt?: string;
    driver?: { id?: number; firstName?: string; lastName?: string; phone?: string } | null;
};

type BalanceRow = {
    driverId: number;
    balance: string | number;
    updatedAt: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
};

const fmt = (n: number, sym = 'ل.س') =>
    `${Number(n).toLocaleString('ar-SY', { maximumFractionDigits: 0 })} ${sym}`;

const methodLabel: Record<string, { ar: string; en: string }> = {
    bank: { ar: 'تحويل بنكي', en: 'Bank transfer' },
    cash: { ar: 'كاش', en: 'Cash' },
};

export default function WalletPage() {
    const [pending, setPending] = useState<TopupRequest[]>([]);
    const [balances, setBalances] = useState<BalanceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'pending' | 'balances'>('pending');
    const { isAr } = useI18n();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [pendingRes, balancesRes] = await Promise.all([
                walletApi.getPendingTopups(),
                walletApi.getBalances(),
            ]);
            setPending(Array.isArray(pendingRes.data) ? pendingRes.data : []);
            setBalances(Array.isArray(balancesRes.data) ? balancesRes.data : []);
        } catch {
            setPending([]);
            setBalances([]);
            toast.error(isAr ? 'فشل تحميل المحفظة' : 'Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    }, [isAr]);

    useEffect(() => { load(); }, [load]);
    useRealtimeUpdates(load);

    const approve = async (id: number) => {
        try {
            await walletApi.approveTopup(id);
            toast.success(isAr ? 'تم شحن المحفظة' : 'Wallet topped up');
            load();
        } catch {
            toast.error(isAr ? 'فشل القبول' : 'Approve failed');
        }
    };

    const reject = async (id: number) => {
        const note = window.prompt(isAr ? 'سبب الرفض (اختياري)' : 'Rejection reason (optional)') ?? '';
        try {
            await walletApi.rejectTopup(id, note || undefined);
            toast.success(isAr ? 'تم الرفض' : 'Request rejected');
            load();
        } catch {
            toast.error(isAr ? 'فشل الرفض' : 'Reject failed');
        }
    };

    if (loading) {
        return (
            <>
                <Header title={isAr ? 'محفظة السائقين' : 'Driver Wallet'} />
                <div style={{ padding: 20, color: '#71717a' }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
            </>
        );
    }

    return (
        <>
            <Header title={isAr ? 'محفظة السائقين' : 'Driver Wallet'} />
            <div style={{ padding: '28px 32px' }}>

                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {(['pending', 'balances'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: tab === t ? '#a78bfa' : 'rgba(255,255,255,0.05)',
                                color: tab === t ? '#000' : '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            {t === 'pending'
                                ? `${isAr ? 'طلبات شحن معلقة' : 'Pending top-ups'} (${pending.length})`
                                : isAr ? 'كل الأرصدة' : 'All balances'}
                        </button>
                    ))}
                </div>

                {tab === 'pending' && (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {pending.length === 0 && (
                            <div style={{ color: '#71717a' }}>
                                {isAr ? 'لا توجد طلبات شحن بانتظار المراجعة' : 'No pending top-up requests'}
                            </div>
                        )}
                        {pending.map((r) => {
                            const method = methodLabel[r.method] ?? { ar: r.method, en: r.method };
                            const name = [r.driver?.firstName, r.driver?.lastName].filter(Boolean).join(' ')
                                || r.driver?.phone
                                || `#${r.driverId}`;
                            return (
                                <div
                                    key={r.id}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 16,
                                        padding: 16,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>
                                                {fmt(+r.amount)}
                                            </div>
                                            <div style={{ color: '#a1a1aa', fontSize: 13, marginTop: 4 }}>
                                                {name} · {r.driver?.phone}
                                            </div>
                                            <div style={{ color: '#71717a', fontSize: 12, marginTop: 4 }}>
                                                {isAr ? method.ar : method.en} {r.reference ? `· Ref: ${r.reference}` : ''}
                                            </div>
                                            {r.note && (
                                                <div style={{ color: '#71717a', fontSize: 12, marginTop: 4 }}>{r.note}</div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <button
                                                onClick={() => approve(r.id)}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: 10,
                                                    border: 0,
                                                    background: '#22c55e',
                                                    color: '#000',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {isAr ? 'قبول وشحن' : 'Approve & top up'}
                                            </button>
                                            <button
                                                onClick={() => reject(r.id)}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: 10,
                                                    border: '1px solid #ef4444',
                                                    background: 'transparent',
                                                    color: '#ef4444',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {isAr ? 'رفض' : 'Reject'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {tab === 'balances' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                        {balances.length === 0 && (
                            <div style={{ color: '#71717a' }}>
                                {isAr ? 'لا يوجد سائقون لديهم رصيد محفظة بعد' : 'No driver wallets yet'}
                            </div>
                        )}
                        {balances.map((b) => {
                            const name = [b.firstName, b.lastName].filter(Boolean).join(' ') || b.phone || `#${b.driverId}`;
                            const balance = +b.balance;
                            return (
                                <div
                                    key={b.driverId}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 16,
                                        padding: 16,
                                    }}
                                >
                                    <div style={{ fontWeight: 800, color: '#c4b5fd', marginBottom: 8 }}>{name}</div>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: balance > 0 ? '#4ade80' : '#f87171' }}>
                                        {fmt(balance)}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 6 }}>
                                        {isAr ? 'آخر تحديث: ' : 'Updated: '}
                                        {new Date(b.updatedAt).toLocaleString(isAr ? 'ar-SY' : 'en-US')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
