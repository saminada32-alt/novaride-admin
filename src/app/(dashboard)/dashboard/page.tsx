'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStats } from '@/hooks/useStats';
import { useRides } from '@/hooks/useRides';
import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { driversApi } from '@/lib/api';
import { approveDriverFull } from '@/lib/approve-driver';
import type { Driver } from '@/lib/types';

const STATUS_COLORS: any = {
    SEARCHING: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24' },
    DRIVER_ASSIGNED: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa' },
    DRIVER_ARRIVED: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa' },
    PASSENGER_ONBOARD: { bg: 'rgba(99,102,241,0.1)', text: '#818cf8' },
    TRIP_STARTED: { bg: 'rgba(139,92,246,0.1)', text: '#a78bfa' },
    COMPLETED: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80' },
    CANCELLED: { bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
    NO_DRIVER_FOUND: { bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
};

export default function DashboardPage() {
    const router = useRouter();
    const { stats, health, loading } = useStats();
    const { rides } = useRides();
    const { t, isAr } = useI18n();
    const [pendingDrivers, setPendingDrivers] = useState<Driver[]>([]);
    const [approvingId, setApprovingId] = useState<number | null>(null);

    const loadPending = useCallback(() => {
        driversApi.getAll('pending')
            .then((res) => setPendingDrivers(res.data.slice(0, 8)))
            .catch(() => setPendingDrivers([]));
    }, []);

    useEffect(() => {
        loadPending();
    }, [loadPending, stats?.pendingDrivers]);

    async function handleApprove(driverId: number) {
        setApprovingId(driverId);
        try {
            await approveDriverFull(driverId);
            toast.success(isAr ? 'تم قبول السائق' : 'Driver approved');
            loadPending();
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'Failed');
        } finally {
            setApprovingId(null);
        }
    }

    if (loading) return (
        <>
            <Header title={t.dashboard} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '400px' }}>
                <div style={{
                    width: '36px', height: '36px',
                    border: '3px solid rgba(99,102,241,0.2)',
                    borderTopColor: '#6366f1', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </>
    );

    const statCards = [
        {
            title: t.totalDrivers,
            value: stats?.totalDrivers ?? 0,
            change: `${stats?.pendingDrivers ?? 0} ${t.pendingApproval}`,
            color: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)', icon: '#818cf8' },
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        },
        {
            title: t.onlineDrivers,
            value: stats?.onlineDrivers ?? 0,
            change: t.activeRightNow,
            color: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)', icon: '#4ade80' },
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
        },
        {
            title: t.totalRides,
            value: stats?.totalRides ?? 0,
            change: `${stats?.completedRides ?? 0} ${t.completed}`,
            color: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', icon: '#60a5fa' },
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v4h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
        },
        {
            title: t.activeRides,
            value: stats?.activeRides ?? 0,
            change: t.inProgressNow,
            color: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', icon: '#fbbf24' },
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
        },
    ];

    const overviewItems = [
        { label: t.approvedDrivers, value: stats?.approvedDrivers ?? 0, total: stats?.totalDrivers ?? 1, color: '#4ade80' },
        { label: t.pendingReview, value: stats?.pendingDrivers ?? 0, total: stats?.totalDrivers ?? 1, color: '#fbbf24' },
        { label: t.onlineNow, value: stats?.onlineDrivers ?? 0, total: stats?.approvedDrivers ?? 1, color: '#818cf8' },
        { label: t.completedRides, value: stats?.completedRides ?? 0, total: stats?.totalRides ?? 1, color: '#60a5fa' },
        { label: t.cancelledRides, value: stats?.cancelledRides ?? 0, total: stats?.totalRides ?? 1, color: '#f87171' },
    ];

    return (
        <>
            <Header title={t.dashboard} />
            <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>

                {/* System Status */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                    padding: '11px 18px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', marginBottom: '24px',
                    fontSize: '12px',
                }}>
                    <span style={{ color: '#52525b', fontWeight: '600' }}>{t.systemStatus}</span>

                    {[
                        { label: 'Database', status: health?.db },
                        { label: 'Redis', status: health?.redis },
                    ].map(({ label, status }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: status === 'ok' ? '#22c55e' : '#ef4444',
                                boxShadow: status === 'ok' ? '0 0 6px #22c55e40' : 'none',
                            }} />
                            <span style={{ color: status === 'ok' ? '#4ade80' : '#f87171' }}>
                                {label} · {status ?? '—'}
                            </span>
                        </div>
                    ))}

                    <span style={{ color: '#3f3f46', marginLeft: 'auto' }}>
                        {t.uptime} {health
                            ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`
                            : '—'}
                    </span>
                </div>

                {/* Pending driver approvals — prominent at top */}
                <div style={{
                    background: 'var(--bg-card, rgba(255,255,255,0.02))',
                    border: '1px solid var(--border, rgba(255,255,255,0.07))',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '24px',
                }}>
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-1, #e4e4e7)' }}>
                                {isAr ? 'طلبات السائقين المعلّقة' : 'Pending driver applications'}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-4, #52525b)', marginTop: 2 }}>
                                {stats?.pendingDrivers ?? pendingDrivers.length} {isAr ? 'بانتظار المراجعة' : 'awaiting review'}
                            </p>
                        </div>
                        <Link href="/drivers?tab=pending" style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'none' }}>
                            {isAr ? 'عرض الكل' : 'View all'}
                        </Link>
                    </div>

                    {pendingDrivers.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-4, #3f3f46)', fontSize: '13px' }}>
                            {isAr ? 'لا يوجد طلبات معلّقة' : 'No pending applications'}
                        </div>
                    ) : (
                        pendingDrivers.map((driver) => (
                            <div
                                key={driver.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 20px',
                                    borderBottom: '1px solid var(--border, rgba(255,255,255,0.04))',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => router.push(`/drivers/${driver.id}`)}
                                >
                                    <p style={{ fontSize: '13px', color: 'var(--text-1, #e4e4e7)', fontWeight: '600' }}>
                                        {(driver.firstName || driver.lastName)
                                            ? `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim()
                                            : driver.phone}
                                    </p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-4, #52525b)' }}>
                                        {driver.phone} · {formatRelativeTime(driver.createdAt)}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{
                                        fontSize: '10px',
                                        padding: '3px 8px',
                                        borderRadius: '20px',
                                        background: 'rgba(245,158,11,0.1)',
                                        color: '#fbbf24',
                                    }}>
                                        {t.pending}
                                    </span>
                                    <button
                                        onClick={() => handleApprove(driver.id)}
                                        disabled={approvingId === driver.id}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            background: 'rgba(34,197,94,0.15)',
                                            border: '1px solid rgba(34,197,94,0.3)',
                                            color: '#4ade80',
                                            cursor: approvingId === driver.id ? 'wait' : 'pointer',
                                        }}
                                    >
                                        {approvingId === driver.id ? '...' : (isAr ? 'قبول' : 'Approve')}
                                    </button>
                                    <button
                                        onClick={() => router.push(`/drivers/${driver.id}`)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            fontSize: 11,
                                            background: 'var(--bg-hover, rgba(255,255,255,0.04))',
                                            border: '1px solid var(--border, rgba(255,255,255,0.08))',
                                            color: 'var(--text-2, #a1a1aa)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {t.view}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                    {statCards.map((card) => (
                        <div key={card.title} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '16px', padding: '20px',
                            transition: 'border-color 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.06em' }}>
                                    {card.title}
                                </p>
                                <div style={{
                                    padding: '7px', borderRadius: '9px',
                                    background: card.color.bg, border: `1px solid ${card.color.border}`,
                                    color: card.color.icon,
                                }}>
                                    {card.icon}
                                </div>
                            </div>
                            <p style={{ fontSize: '30px', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                                {card.value.toLocaleString()}
                            </p>
                            <p style={{ fontSize: '11px', color: '#3f3f46', marginTop: '6px' }}>{card.change}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '16px' }}>

                    {/* Recent Rides */}
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', overflow: 'hidden',
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>
                                {t.recentRides}
                            </p>
                            <span style={{ fontSize: '11px', color: '#3f3f46' }}>
                                {rides.length} {t.total}
                            </span>
                        </div>

                        {rides.slice(0, 8).length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
                                {t.noRidesYet}
                            </div>
                        ) : (
                            rides.slice(0, 8).map((ride) => {
                                const s = STATUS_COLORS[ride.status] ?? { bg: 'rgba(255,255,255,0.05)', text: '#71717a' };
                                return (
                                    <div
                                        key={ride.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '11px 20px',
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            transition: 'background 0.15s', cursor: 'default',
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                                                background: 'rgba(99,102,241,0.08)',
                                                border: '1px solid rgba(99,102,241,0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                                                    <rect x="1" y="3" width="15" height="13" rx="2" />
                                                    <path d="M16 8h4l3 3v4h-7V8z" />
                                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '13px', color: '#e4e4e7', fontWeight: '500' }}>
                                                    {isAr ? `رحلة` : 'Ride'} #{ride.id}
                                                </p>
                                                <p style={{ fontSize: '11px', color: '#52525b' }}>
                                                    {formatRelativeTime(ride.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                                                {formatCurrency(ride.estimatedFare)}
                                            </span>
                                            <span style={{
                                                fontSize: '10px', fontWeight: '500', padding: '2px 7px',
                                                borderRadius: '20px', background: s.bg, color: s.text,
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {ride.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Overview */}
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', overflow: 'hidden',
                    }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>
                                {t.driverOverview}
                            </p>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {overviewItems.map((item) => {
                                const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                                return (
                                    <div key={item.label} style={{ marginBottom: '18px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                                            <span style={{ fontSize: '12px', color: '#71717a' }}>{item.label}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#e4e4e7' }}>
                                                    {item.value}
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#3f3f46' }}>({pct}%)</span>
                                            </div>
                                        </div>
                                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', width: `${pct}%`,
                                                background: item.color,
                                                borderRadius: '99px',
                                                boxShadow: `0 0 8px ${item.color}50`,
                                                transition: 'width 1s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
        </>
    );
}