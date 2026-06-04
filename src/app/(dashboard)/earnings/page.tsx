'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { driversApi, earningsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Driver, EarningDashboard } from '@/lib/types';

interface Row { driver: Driver; dashboard: EarningDashboard; }

export default function EarningsPage() {
    const { t } = useI18n();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const res = await driversApi.getAll('approved');
                const withE = await Promise.all(
                    (res.data as Driver[]).map(async d => {
                        try {
                            const r = await earningsApi.getDashboard(d.id);
                            return { driver: d, dashboard: r.data };
                        } catch {
                            return { driver: d, dashboard: { daily: 0, weekly: 0, monthly: 0, total: 0, trips: 0 } };
                        }
                    })
                );
                withE.sort((a, b) => b.dashboard.total - a.dashboard.total);
                setRows(withE);
            } catch { toast.error('Failed'); }
            finally { setLoading(false); }
        }
        load();
    }, []);

    const filtered = rows.filter(({ driver: d }) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return d.phone.includes(q) || d.firstName?.toLowerCase().includes(q) || d.lastName?.toLowerCase().includes(q);
    });

    const totalE = rows.reduce((s, r) => s + r.dashboard.total, 0);
    const totalT = rows.reduce((s, r) => s + r.dashboard.daily, 0);
    const totalR = rows.reduce((s, r) => s + r.dashboard.trips, 0);

    const maxTotal = Math.max(...rows.map(r => r.dashboard.total), 1);

    function StatCard({ title, value, sub, color }: any) {
        const colors: any = {
            green: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)', text: '#4ade80' },
            indigo: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)', text: '#818cf8' },
            blue: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
        };
        const c = colors[color];
        return (
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', padding: '20px 24px',
            }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.06em', marginBottom: '10px' }}>
                    {title}
                </p>
                <p style={{ fontSize: '26px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>{value}</p>
                <p style={{ fontSize: '12px', color: '#3f3f46', marginTop: '4px' }}>{sub}</p>
            </div>
        );
    }

    return (
        <>
            <Header title={t.earnings} />
            <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{t.earnings}</h2>
                    <p style={{ fontSize: '13px', color: '#52525b' }}>{t.revenueOverview}</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
                    <StatCard title={t.totalEarnings} value={formatCurrency(totalE)} sub={t.allTimeLower} color="green" />
                    <StatCard title={t.todayRevenue} value={formatCurrency(totalT)} sub={t.acrossAll} color="indigo" />
                    <StatCard title={t.totalTrips} value={totalR.toLocaleString()} sub={t.completedLower} color="blue" />
                </div>

                {/* Top Drivers Chart */}
                {rows.length > 0 && (
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', padding: '24px',
                        marginBottom: '24px',
                    }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7', marginBottom: '20px' }}>
                            {t.topDrivers}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {rows.slice(0, 5).map(({ driver: d, dashboard: e }, i) => {
                                const pct = Math.round((e.total / maxTotal) * 100);
                                return (
                                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <span style={{ fontSize: '11px', color: '#3f3f46', width: '14px', textAlign: 'right' }}>
                                            {i + 1}
                                        </span>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '7px',
                                            background: 'rgba(99,102,241,0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: '700', color: '#818cf8', flexShrink: 0,
                                        }}>
                                            {(d.firstName?.[0] ?? d.phone[1]).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontSize: '12px', color: '#d4d4d8' }}>
                                                    {d.firstName && d.lastName ? `${d.firstName} ${d.lastName}` : d.phone}
                                                </span>
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>
                                                    {formatCurrency(e.total)}
                                                </span>
                                            </div>
                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                                                <div style={{
                                                    height: '100%', width: `${pct}%`,
                                                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                    borderRadius: '99px', transition: 'width 0.8s ease',
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '16px', width: '280px' }}>
                    <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={t.searchDriver}
                        style={{
                            height: '38px', paddingLeft: '36px', paddingRight: '14px', width: '100%',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px', color: '#e4e4e7', fontSize: '13px', outline: 'none',
                        }}
                    />
                </div>

                {/* Table */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
                        padding: '12px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '11px', color: '#52525b', fontWeight: '600', letterSpacing: '0.06em',
                    }}>
                        <span>{t.driver.toUpperCase()}</span>
                        <span>{t.today.toUpperCase()}</span>
                        <span>{t.thisWeek.toUpperCase()}</span>
                        <span>{t.thisMonth.toUpperCase()}</span>
                        <span>{t.allTime.toUpperCase()}</span>
                        <span>{t.trips.toUpperCase()}</span>
                    </div>

                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                {Array.from({ length: 6 }).map((_, j) => <div key={j} style={{ height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite', marginRight: '12px' }} />)}
                            </div>
                        ))
                    ) : filtered.map(({ driver: d, dashboard: e }) => (
                        <div key={d.id} style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
                            padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                            alignItems: 'center', transition: 'background 0.15s',
                        }}
                            onMouseEnter={e2 => (e2.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e2 => (e2.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#818cf8', flexShrink: 0 }}>
                                    {(d.firstName?.[0] ?? d.phone[1]).toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#e4e4e7' }}>
                                        {d.firstName && d.lastName ? `${d.firstName} ${d.lastName}` : t.noName}
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#52525b', fontFamily: 'monospace' }}>{d.phone}</p>
                                </div>
                            </div>
                            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{formatCurrency(e.daily)}</span>
                            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{formatCurrency(e.weekly)}</span>
                            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{formatCurrency(e.monthly)}</span>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{formatCurrency(e.total)}</span>
                            <span style={{ fontSize: '13px', color: '#71717a' }}>{e.trips}</span>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </>
    );
}