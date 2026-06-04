'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { subscriptionsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

type Subscription = {
    id: number;
    driverId?: number;
    totalOwed: number;
    totalPaid: number;
    totalEarned: number;
    balance?: number;
    nextDueAt?: string;
    status: string;
    planType: string;
    commissionPercent?: number;
    monthlyFee?: number;
    paymentMethod?: string;
    currencySymbol?: string;
    driver?: {
        id?: number;
        firstName?: string;
        lastName?: string;
        phone?: string;
    };
    pendingPayments?: Array<{
        id: number;
        amount: number;
        method: string;
        reference?: string;
        createdAt?: string;
    }>;
};

type PendingPayment = {
    id: number;
    amount: number;
    method: string;
    reference?: string;
    note?: string;
    createdAt?: string;
    subscription?: Subscription & { driver?: Subscription['driver'] };
};

const fmt = (n: number, sym = 'ل.س') =>
    `${Number(n).toLocaleString('ar-SY', { maximumFractionDigits: 0 })} ${sym}`;

const statusStyle: Record<string, { c: string; g: string }> = {
    active: { c: '#22c55e', g: 'rgba(34,197,94,0.25)' },
    pending_payment: { c: '#f59e0b', g: 'rgba(245,158,11,0.25)' },
    suspended: { c: '#ef4444', g: 'rgba(239,68,68,0.25)' },
};

export default function SubscriptionsPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [pending, setPending] = useState<PendingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [tab, setTab] = useState<'subs' | 'pending'>('pending');
    const [paying, setPaying] = useState<number | null>(null);
    const { isAr } = useI18n();

    const [payForm, setPayForm] = useState({
        amount: '',
        method: 'sham_cash',
        reference: '',
        note: '',
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [subsRes, pendingRes] = await Promise.all([
                subscriptionsApi.getAll(filter),
                subscriptionsApi.getPendingPayments(),
            ]);
            const subsData = subsRes.data;
            const list: Subscription[] = Array.isArray(subsData)
                ? subsData
                : Array.isArray(subsData?.data)
                    ? subsData.data
                    : [];
            setSubs(list);
            setPending(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        } catch {
            setSubs([]);
            setPending([]);
            toast.error(isAr ? 'فشل تحميل الاشتراكات' : 'Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    }, [filter, isAr]);

    useEffect(() => { load(); }, [load]);
    useRealtimeUpdates(load);

    const confirmManualPayment = async (subId: number) => {
        try {
            await subscriptionsApi.confirmPayment(subId, {
                amount: parseFloat(payForm.amount),
                method: payForm.method,
                reference: payForm.reference,
                note: payForm.note,
            });
            setPaying(null);
            toast.success(isAr ? 'تم تأكيد الدفع' : 'Payment confirmed');
            load();
        } catch {
            toast.error(isAr ? 'فشل تأكيد الدفع' : 'Payment confirmation failed');
        }
    };

    const approve = async (paymentId: number) => {
        try {
            await subscriptionsApi.approvePayment(paymentId);
            toast.success(isAr ? 'تم قبول الدفع' : 'Payment approved');
            load();
        } catch {
            toast.error(isAr ? 'فشل القبول' : 'Approve failed');
        }
    };

    const reject = async (paymentId: number) => {
        const note = window.prompt(isAr ? 'سبب الرفض (اختياري)' : 'Rejection reason (optional)') ?? '';
        try {
            await subscriptionsApi.rejectPayment(paymentId, note || undefined);
            toast.success(isAr ? 'تم الرفض' : 'Payment rejected');
            load();
        } catch {
            toast.error(isAr ? 'فشل الرفض' : 'Reject failed');
        }
    };

    const suspend = async (subId: number) => {
        if (!window.confirm(isAr ? 'تعليق الاشتراك؟' : 'Suspend subscription?')) return;
        try {
            await subscriptionsApi.suspend(subId, 'Admin suspended');
            toast.success(isAr ? 'تم التعليق' : 'Suspended');
            load();
        } catch {
            toast.error(isAr ? 'فشل التعليق' : 'Suspend failed');
        }
    };

    if (loading) {
        return (
            <>
                <Header title={isAr ? 'الاشتراكات' : 'Subscriptions'} />
                <div style={{ padding: 20, color: '#71717a' }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
            </>
        );
    }

    return (
        <>
            <Header title={isAr ? 'الاشتراكات والمدفوعات' : 'Subscriptions & Payments'} />
            <div style={{ padding: '28px 32px' }}>

                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {(['pending', 'subs'] as const).map((t) => (
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
                                ? `${isAr ? 'مدفوعات معلقة' : 'Pending'} (${pending.length})`
                                : isAr ? 'كل الاشتراكات' : 'All subscriptions'}
                        </button>
                    ))}
                </div>

                {tab === 'pending' && (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {pending.length === 0 && (
                            <div style={{ color: '#71717a' }}>
                                {isAr ? 'لا توجد مدفوعات بانتظار المراجعة' : 'No pending payments'}
                            </div>
                        )}
                        {pending.map((p) => {
                            const sub = p.subscription;
                            const driver = sub?.driver;
                            const sym = sub?.currencySymbol ?? 'ل.س';
                            return (
                                <div
                                    key={p.id}
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
                                                {fmt(+p.amount, sym)}
                                            </div>
                                            <div style={{ color: '#a1a1aa', fontSize: 13, marginTop: 4 }}>
                                                {driver?.firstName} {driver?.lastName} · {driver?.phone}
                                            </div>
                                            <div style={{ color: '#71717a', fontSize: 12, marginTop: 4 }}>
                                                {p.method} {p.reference ? `· Ref: ${p.reference}` : ''}
                                            </div>
                                            {p.note && (
                                                <div style={{ color: '#71717a', fontSize: 12, marginTop: 4 }}>{p.note}</div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <button
                                                onClick={() => approve(p.id)}
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
                                                {isAr ? 'قبول' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => reject(p.id)}
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

                {tab === 'subs' && (
                    <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            {['all', 'active', 'pending_payment', 'suspended'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 10,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: filter === f ? '#a78bfa' : 'rgba(255,255,255,0.05)',
                                        color: filter === f ? '#000' : '#fff',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                            {subs.map((s) => {
                                const balance = s.balance ?? (s.totalOwed - s.totalPaid);
                                const st = statusStyle[s.status] || { c: '#999', g: 'rgba(255,255,255,0.1)' };
                                const sym = s.currencySymbol ?? 'ل.س';
                                const name = [s.driver?.firstName, s.driver?.lastName].filter(Boolean).join(' ')
                                    || s.driver?.phone
                                    || `#${s.driverId ?? s.driver?.id ?? '?'}`;

                                return (
                                    <div
                                        key={s.id}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 16,
                                            padding: 16,
                                        }}
                                    >
                                        <div style={{ fontWeight: 800, color: '#c4b5fd', marginBottom: 8 }}>{name}</div>
                                        <div style={{ fontSize: 13, color: '#a1a1aa' }}>
                                            {s.planType === 'commission'
                                                ? `${s.commissionPercent}% ${isAr ? 'عمولة' : 'commission'}`
                                                : `${fmt(s.monthlyFee ?? 0, sym)}/${isAr ? 'شهر' : 'mo'}`}
                                        </div>
                                        <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900, color: balance > 0 ? '#f87171' : '#4ade80' }}>
                                            {isAr ? 'المستحق: ' : 'Due: '}{fmt(balance, sym)}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#71717a', marginTop: 6 }}>
                                            {isAr ? 'أرباح: ' : 'Earned: '}{fmt(s.totalEarned, sym)} · {isAr ? 'مدفوع: ' : 'Paid: '}{fmt(s.totalPaid, sym)}
                                        </div>
                                        <div
                                            style={{
                                                marginTop: 10,
                                                padding: '4px 10px',
                                                borderRadius: 999,
                                                border: `1px solid ${st.c}`,
                                                color: st.c,
                                                fontWeight: 800,
                                                fontSize: 11,
                                                display: 'inline-block',
                                            }}
                                        >
                                            {s.status}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                            <button
                                                onClick={() => {
                                                    setPaying(s.id);
                                                    setPayForm({
                                                        amount: balance.toFixed(0),
                                                        method: s.paymentMethod ?? 'sham_cash',
                                                        reference: '',
                                                        note: '',
                                                    });
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    borderRadius: 10,
                                                    border: 0,
                                                    background: '#22c55e',
                                                    color: '#000',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {isAr ? 'تسجيل دفع' : 'Record payment'}
                                            </button>
                                            {s.status !== 'suspended' && (
                                                <button
                                                    onClick={() => suspend(s.id)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: 10,
                                                        border: '1px solid #ef4444',
                                                        background: 'transparent',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {isAr ? 'تعليق' : 'Suspend'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {paying && (
                    <div
                        onClick={() => setPaying(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 50,
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: 400,
                                background: '#18181b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 16,
                                padding: 20,
                            }}
                        >
                            <h2 style={{ fontWeight: 900, marginBottom: 16, color: '#fff' }}>
                                {isAr ? 'تأكيد الدفع' : 'Confirm Payment'}
                            </h2>
                            <input
                                value={payForm.amount}
                                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                                placeholder={isAr ? 'المبلغ' : 'Amount'}
                                style={inputStyle}
                            />
                            <select
                                value={payForm.method}
                                onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                                style={{ ...inputStyle, marginTop: 8 }}
                            >
                                <option value="cash">Cash</option>
                                <option value="sham_cash">Sham Cash</option>
                                <option value="bank">Bank</option>
                                <option value="balance">Balance</option>
                            </select>
                            <input
                                value={payForm.reference}
                                onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                                placeholder={isAr ? 'رقم العملية' : 'Reference'}
                                style={{ ...inputStyle, marginTop: 8 }}
                            />
                            <button
                                onClick={() => confirmManualPayment(paying)}
                                style={{
                                    width: '100%',
                                    marginTop: 12,
                                    padding: 12,
                                    borderRadius: 10,
                                    background: '#22c55e',
                                    border: 0,
                                    fontWeight: 800,
                                    color: '#000',
                                    cursor: 'pointer',
                                }}
                            >
                                {isAr ? 'تأكيد' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#111',
    color: '#fff',
};
