'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { walletApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { panel } from '@/lib/panel-styles';

type TopupRequest = {
    id: number;
    driverId: number;
    amount: number | string;
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

type Tab = 'pending' | 'history' | 'balances';

const fmt = (n: number) =>
    `${Math.round(Number(n)).toLocaleString('en-US')} ل.س`;

const driverName = (d?: { firstName?: string; lastName?: string; phone?: string } | null, id?: number) =>
    [d?.firstName, d?.lastName].filter(Boolean).join(' ') || d?.phone || `#${id ?? '?'}`;

const STATUS: Record<string, { c: string; ar: string; en: string }> = {
    pending: { c: '#f59e0b', ar: 'بانتظار الاعتماد', en: 'Pending' },
    approved: { c: '#22c55e', ar: 'تم الشحن', en: 'Approved' },
    rejected: { c: '#ef4444', ar: 'مرفوض', en: 'Rejected' },
};

export default function WalletPage() {
    const { isAr } = useI18n();
    const [tab, setTab] = useState<Tab>('pending');
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState<TopupRequest[]>([]);
    const [history, setHistory] = useState<TopupRequest[]>([]);
    const [balances, setBalances] = useState<BalanceRow[]>([]);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            const [p, h, b] = await Promise.all([
                walletApi.getPendingTopups(),
                walletApi.getAllTopups('all'),
                walletApi.getBalances(),
            ]);
            setPending(Array.isArray(p.data) ? p.data : []);
            setHistory(Array.isArray(h.data) ? h.data : []);
            setBalances(Array.isArray(b.data) ? b.data : []);
        } catch {
            toast.error(isAr ? 'تعذّر تحميل بيانات المحفظة' : 'Could not load wallet data');
        } finally {
            setLoading(false);
        }
    }, [isAr]);

    useEffect(() => { load(); }, [load]);
    useRealtimeUpdates(load);

    const stats = useMemo(() => ({
        pendingCount: pending.length,
        pendingSum: pending.reduce((a, r) => a + Number(r.amount), 0),
        totalBalance: balances.reduce((a, b) => a + Number(b.balance), 0),
        blocked: balances.filter((b) => Number(b.balance) <= 0).length,
    }), [pending, balances]);

    async function approve(r: TopupRequest) {
        const ok = window.confirm(
            isAr
                ? `تأكيد استلام ${fmt(Number(r.amount))} من ${driverName(r.driver, r.driverId)} وشحن رصيده؟`
                : `Confirm you received ${fmt(Number(r.amount))} from ${driverName(r.driver, r.driverId)} and top up their wallet?`,
        );
        if (!ok) return;
        setBusyId(r.id);
        try {
            await walletApi.approveTopup(r.id);
            toast.success(isAr ? 'تم شحن رصيد السائق' : 'Driver wallet topped up');
            load();
        } catch {
            toast.error(isAr ? 'فشل الاعتماد' : 'Approval failed');
        } finally {
            setBusyId(null);
        }
    }

    async function reject(r: TopupRequest) {
        const note = window.prompt(isAr ? 'سبب الرفض (يظهر للسائق عبر SMS)' : 'Reason for rejecting (sent to the driver by SMS)');
        if (note === null) return;
        setBusyId(r.id);
        try {
            await walletApi.rejectTopup(r.id, note || undefined);
            toast.success(isAr ? 'تم رفض الطلب' : 'Request rejected');
            load();
        } catch {
            toast.error(isAr ? 'فشل الرفض' : 'Reject failed');
        } finally {
            setBusyId(null);
        }
    }

    const methodLabel = (m: string) =>
        m === 'bank' ? (isAr ? 'تحويل بنكي' : 'Bank transfer') : (isAr ? 'كاش' : 'Cash');

    const summary = [
        {
            label: isAr ? 'طلبات بانتظار الاعتماد' : 'Requests waiting',
            value: String(stats.pendingCount),
            hint: stats.pendingCount ? fmt(stats.pendingSum) : (isAr ? 'لا شيء معلّق' : 'Nothing pending'),
            color: stats.pendingCount ? '#f59e0b' : '#22c55e',
        },
        {
            label: isAr ? 'إجمالي أرصدة السائقين' : 'Total driver balances',
            value: fmt(stats.totalBalance),
            hint: isAr ? 'المبلغ المدفوع مسبقاً وغير المستهلك' : 'Prepaid money not yet spent',
            color: '#6366f1',
        },
        {
            label: isAr ? 'سائقون لا يستطيعون العمل' : 'Drivers who can\'t go online',
            value: String(stats.blocked),
            hint: isAr ? 'رصيدهم صفر أو أقل — بحاجة لشحن' : 'Balance is zero or negative',
            color: stats.blocked ? '#ef4444' : '#22c55e',
        },
    ];

    const tabs: { id: Tab; label: string; n?: number }[] = [
        { id: 'pending', label: isAr ? 'بانتظار الاعتماد' : 'Pending', n: pending.length },
        { id: 'history', label: isAr ? 'السجل' : 'History' },
        { id: 'balances', label: isAr ? 'أرصدة السائقين' : 'Balances' },
    ];

    const rowStyle = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
    } as const;

    return (
        <>
            <Header title={isAr ? 'محفظة السائقين' : 'Driver Wallet'} />
            <div style={panel.page}>

                <div style={{
                    ...panel.cardSubtle, padding: '14px 18px', marginBottom: 20,
                    fontSize: 13, lineHeight: 1.7, ...panel.textSecondary,
                }}>
                    {isAr
                        ? 'السائق يشحن رصيده أولاً ثم يعمل، وتُخصم عمولة 10% تلقائياً من كل رحلة. الشحن عبر شام كاش يُضاف تلقائياً. أما التحويل البنكي والكاش فيظهران هنا ليتأكد فريقك من استلام المبلغ قبل الاعتماد.'
                        : 'Drivers top up first, then work; a 10% commission is deducted from each ride. Sham Cash top-ups are credited automatically. Bank and cash requests appear here so your team can confirm the money arrived before approving.'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 22 }}>
                    {summary.map((s) => (
                        <div key={s.label} style={{ ...panel.card, padding: '16px 18px', borderInlineStart: `4px solid ${s.color}` }}>
                            <p style={{ fontSize: 12, ...panel.textMuted }}>{s.label}</p>
                            <p style={{ fontSize: 24, fontWeight: 800, margin: '4px 0', color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: 11, ...panel.textMuted }}>{s.hint}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {tabs.map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={panel.tab(tab === t.id)}>
                            {t.label}{t.n ? ` (${t.n})` : ''}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p style={{ ...panel.textMuted, padding: 20 }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
                ) : (
                    <div style={{ ...panel.card, overflow: 'hidden' }}>

                        {tab === 'pending' && (pending.length === 0 ? (
                            <p style={{ padding: 32, textAlign: 'center', ...panel.textMuted }}>
                                {isAr ? 'لا توجد طلبات شحن بانتظار الاعتماد' : 'No top-up requests waiting'}
                            </p>
                        ) : pending.map((r) => (
                            <div key={r.id} style={rowStyle}>
                                <div>
                                    <p style={{ fontSize: 18, fontWeight: 800, ...panel.text }}>{fmt(Number(r.amount))}</p>
                                    <p style={{ fontSize: 13, marginTop: 2, ...panel.textSecondary }}>
                                        {driverName(r.driver, r.driverId)}{r.driver?.phone ? ` · ${r.driver.phone}` : ''}
                                    </p>
                                    <p style={{ fontSize: 12, marginTop: 2, ...panel.textMuted }}>
                                        {methodLabel(r.method)}
                                        {r.reference ? ` · ${isAr ? 'مرجع' : 'Ref'}: ${r.reference}` : ''}
                                        {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleString(isAr ? 'ar-SY' : 'en-GB')}` : ''}
                                    </p>
                                    {r.note && <p style={{ fontSize: 12, marginTop: 2, ...panel.textMuted }}>{r.note}</p>}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        disabled={busyId === r.id}
                                        onClick={() => approve(r)}
                                        style={{
                                            padding: '9px 16px', borderRadius: 10, border: 0, cursor: 'pointer',
                                            background: '#22c55e', color: '#052e16', fontWeight: 800, fontSize: 13,
                                            opacity: busyId === r.id ? 0.6 : 1,
                                        }}
                                    >
                                        {isAr ? 'استلمت المبلغ — اشحن' : 'Received — top up'}
                                    </button>
                                    <button
                                        disabled={busyId === r.id}
                                        onClick={() => reject(r)}
                                        style={{
                                            padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                                            background: 'transparent', border: '1px solid #ef4444',
                                            color: '#ef4444', fontWeight: 700, fontSize: 13,
                                        }}
                                    >
                                        {isAr ? 'رفض' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        )))}

                        {tab === 'history' && (history.length === 0 ? (
                            <p style={{ padding: 32, textAlign: 'center', ...panel.textMuted }}>
                                {isAr ? 'لا يوجد سجل بعد' : 'No history yet'}
                            </p>
                        ) : history.map((r) => {
                            const st = STATUS[r.status] ?? STATUS.pending;
                            return (
                                <div key={r.id} style={rowStyle}>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700, ...panel.text }}>{fmt(Number(r.amount))}</p>
                                        <p style={{ fontSize: 12, marginTop: 2, ...panel.textSecondary }}>
                                            {driverName(r.driver, r.driverId)} · {methodLabel(r.method)}
                                            {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString(isAr ? 'ar-SY' : 'en-GB')}` : ''}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                        color: st.c, border: `1px solid ${st.c}`,
                                    }}>
                                        {isAr ? st.ar : st.en}
                                    </span>
                                </div>
                            );
                        }))}

                        {tab === 'balances' && (balances.length === 0 ? (
                            <p style={{ padding: 32, textAlign: 'center', ...panel.textMuted }}>
                                {isAr ? 'لم يشحن أي سائق محفظته بعد' : 'No driver has topped up yet'}
                            </p>
                        ) : balances.map((b) => {
                            const bal = Number(b.balance);
                            return (
                                <div key={b.driverId} style={rowStyle}>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 700, ...panel.text }}>{driverName(b, b.driverId)}</p>
                                        <p style={{ fontSize: 12, marginTop: 2, ...panel.textMuted }}>
                                            {b.phone ?? ''} · {isAr ? 'آخر حركة' : 'Last activity'}: {new Date(b.updatedAt).toLocaleDateString(isAr ? 'ar-SY' : 'en-GB')}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'end' }}>
                                        <p style={{ fontSize: 18, fontWeight: 800, color: bal > 0 ? '#22c55e' : '#ef4444' }}>{fmt(bal)}</p>
                                        <p style={{ fontSize: 11, color: bal > 0 ? 'var(--text-3)' : '#ef4444' }}>
                                            {bal > 0 ? (isAr ? 'يستطيع العمل' : 'Can go online') : (isAr ? 'لا يستطيع العمل — يحتاج شحن' : 'Can\'t go online — needs a top-up')}
                                        </p>
                                    </div>
                                </div>
                            );
                        }))}
                    </div>
                )}
            </div>
        </>
    );
}
