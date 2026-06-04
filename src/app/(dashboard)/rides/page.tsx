'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useRides } from '@/hooks/useRides';
import { ridesApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { RideStatus } from '@/lib/types';
import { Pagination } from '@/components/ui/Pagination';
import { exportToCSV, ridesToCSV } from '@/lib/export';


const STATUS_STYLE: any = {
    SCHEDULED: { bg: 'rgba(56,189,248,0.1)', text: '#38bdf8' },
    SEARCHING: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24' },
    DRIVER_ASSIGNED: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa' },
    DRIVER_ARRIVED: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa' },
    PASSENGER_ONBOARD: { bg: 'rgba(99,102,241,0.1)', text: '#818cf8' },
    TRIP_STARTED: { bg: 'rgba(139,92,246,0.1)', text: '#a78bfa' },
    COMPLETED: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80' },
    CANCELLED: { bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
    NO_DRIVER_FOUND: { bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
};

export default function RidesPage() {
    // const { t } = useI18n();
    const [tab, setTab] = useState<RideStatus | ''>('');
    const { rides, loading, refetch } = useRides(tab || undefined);
    const { t, isAr } = useI18n();
    const [page, setPage] = useState(1);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);
    const PAGE_SIZE = 20;
    const paginated = rides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const tabs = [
        { key: '', label: t.all },
        { key: 'SCHEDULED', label: t.scheduledKpi },
        { key: 'SEARCHING', label: t.searching },
        { key: 'DRIVER_ASSIGNED', label: t.assigned },
        { key: 'TRIP_STARTED', label: t.inProgress },
        { key: 'COMPLETED', label: t.completed },
        { key: 'CANCELLED', label: t.cancelled },
    ];

    return (
        <>
            <Header title={t.rides} />
            <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{t.rides}</h2>
                    <p style={{ fontSize: '13px', color: '#52525b' }}>{t.monitorRides}</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {tabs.map(({ key, label }) => (
                        <button key={key} onClick={() => setTab(key as any)} style={{
                            padding: '6px 14px', borderRadius: '20px',
                            border: `1px solid ${tab === key ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)'}`,
                            background: tab === key ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                            color: tab === key ? '#818cf8' : '#71717a',
                            fontSize: '12px', fontWeight: tab === key ? '500' : '400',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                            {label}
                        </button>
                    ))}
                    <span style={{ fontSize: '12px', color: '#3f3f46', alignSelf: 'center', marginLeft: '4px' }}>
                        {rides.length}
                    </span>
                </div>

                <button
                    onClick={() => exportToCSV(ridesToCSV(rides), 'rides')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0 14px', height: '38px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#a1a1aa', fontSize: '12px', fontWeight: '500',
                        cursor: 'pointer', transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'; (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#a1a1aa'; }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {isAr ? 'تصدير CSV' : 'Export CSV'}
                </button>

                {/* Table */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '50px 1.2fr 1.2fr 1fr 0.7fr 1fr 70px 90px 80px 100px 120px',
                        padding: '12px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '11px', color: '#52525b', fontWeight: '600', letterSpacing: '0.06em',
                    }}>
                        <span>#</span>
                        <span>{t.passenger.toUpperCase()}</span>
                        <span>{t.driver.toUpperCase()}</span>
                        <span>PICKUP</span>
                        <span>{isAr ? 'المركبة' : 'VEHICLE'}</span>
                        <span>{isAr ? 'الدفع' : 'PAYMENT'}</span>
                        <span>{t.distance.toUpperCase()}</span>
                        <span>{t.fare.toUpperCase()}</span>
                        <span>{isAr ? 'كود' : 'PROMO'}</span>
                        <span>{t.status.toUpperCase()}</span>
                        <span>{t.date.toUpperCase()}</span>
                    </div>

                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} style={{
                                display: 'grid', gridTemplateColumns: '50px 1.2fr 1.2fr 1fr 0.7fr 0.7fr 70px 80px 100px 120px',
                                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}>
                                {Array.from({ length: 11 }).map((_, j) => (
                                    <div key={j} style={{ height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite', marginRight: '12px' }} />
                                ))}
                            </div>
                        ))
                    ) : rides.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
                            {t.noRidesFound}
                        </div>
                    ) : (
                        rides.map(r => {
                            const s = STATUS_STYLE[r.status] ?? { bg: 'rgba(255,255,255,0.05)', text: '#71717a' };
                            const passengerName = [r.passenger?.firstName, r.passenger?.lastName]
                                .filter(Boolean).join(' ') || r.passenger?.name || '—';
                            const driverName = [r.driver?.firstName, r.driver?.lastName]
                                .filter(Boolean).join(' ') || '—';
                            const payLabel = r.paymentMethod === 'sham_cash'
                                ? (isAr ? 'شام كاش' : 'Sham Cash')
                                : r.paymentMethod === 'cash'
                                    ? (isAr ? 'كاش' : 'Cash')
                                    : '—';
                            return (
                                <div key={r.id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '50px 1.2fr 1.2fr 1fr 0.7fr 1fr 70px 90px 80px 100px 120px',
                                    padding: '13px 20px',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    alignItems: 'center', transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <span style={{ fontSize: '11px', color: '#3f3f46', fontFamily: 'monospace' }}>#{r.id}</span>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#e4e4e7' }}>{passengerName}</p>
                                        <p style={{ fontSize: '11px', color: '#52525b', fontFamily: 'monospace' }}>{r.passenger?.phone}</p>
                                    </div>
                                    <div>
                                        {r.driver ? (
                                            <>
                                                <p style={{ fontSize: '12px', color: '#e4e4e7' }}>{driverName}</p>
                                                <p style={{ fontSize: '11px', color: '#52525b', fontFamily: 'monospace' }}>{r.driver.phone}</p>
                                            </>
                                        ) : <span style={{ fontSize: '12px', color: '#3f3f46' }}>—</span>}
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#71717a' }} title={`${r.pickupLat}, ${r.pickupLng}`}>
                                        {r.pickupAddress ?? `${r.pickupLat.toFixed(3)}, ${r.pickupLng.toFixed(3)}`}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                                        {r.vehicleType ?? '—'}
                                    </span>
                                    <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                                        <p style={{ margin: 0 }}>{payLabel}</p>
                                        {r.paymentMethod === 'sham_cash' && (
                                            <p style={{ margin: '2px 0 0', fontFamily: 'monospace', fontSize: '10px', color: '#71717a' }}>
                                                {r.shamCashReference ?? `RIDE-${r.id}`}
                                            </p>
                                        )}
                                        {r.paymentReference && (
                                            <p style={{ margin: '2px 0 0', fontFamily: 'monospace', fontSize: '10px', color: '#e4e4e7' }}>
                                                {isAr ? 'مرجع:' : 'Ref:'} {r.paymentReference}
                                            </p>
                                        )}
                                        {r.paymentMethod === 'sham_cash' &&
                                            r.status === 'COMPLETED' &&
                                            r.paymentReference &&
                                            !r.paymentConfirmedAt && (
                                                <button
                                                    disabled={confirmingId === r.id}
                                                    onClick={async () => {
                                                        setConfirmingId(r.id);
                                                        try {
                                                            await ridesApi.confirmPayment(r.id);
                                                            await refetch();
                                                        } finally {
                                                            setConfirmingId(null);
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: '4px',
                                                        padding: '2px 8px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(34,197,94,0.3)',
                                                        background: 'rgba(34,197,94,0.1)',
                                                        color: '#4ade80',
                                                        fontSize: '10px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {confirmingId === r.id
                                                        ? '...'
                                                        : (isAr ? 'تأكيد الدفع' : 'Confirm pay')}
                                                </button>
                                            )}
                                        {r.paymentConfirmedAt && (
                                            <span style={{ fontSize: '10px', color: '#4ade80' }}>
                                                ✓ {isAr ? 'مؤكد' : 'Confirmed'}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                                        {r.estimatedDistanceKm.toFixed(1)} km
                                    </span>
                                    <div>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                                            {formatCurrency(r.estimatedFare)}
                                        </span>
                                        {r.promoCode && r.discountAmount != null && r.discountAmount > 0 && (
                                            <p style={{ fontSize: '10px', color: '#71717a', margin: '2px 0 0', textDecoration: 'line-through' }}>
                                                {formatCurrency(r.originalFare ?? r.estimatedFare + r.discountAmount)}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        {r.promoCode ? (
                                            <>
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontFamily: 'monospace',
                                                    fontWeight: '600',
                                                    color: '#4ade80',
                                                }}>
                                                    {r.promoCode}
                                                </span>
                                                {r.discountAmount != null && r.discountAmount > 0 && (
                                                    <p style={{ fontSize: '10px', color: '#4ade80', margin: '2px 0 0' }}>
                                                        −{formatCurrency(r.discountAmount)}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: '#3f3f46' }}>—</span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '20px', background: s.bg, color: s.text, width: 'fit-content' }}>
                                        {r.status.replace(/_/g, ' ')}
                                    </span>
                                    <span style={{ fontSize: '11px', color: r.status === 'SCHEDULED' && r.scheduledAt ? '#38bdf8' : '#52525b' }}>
                                        {r.status === 'SCHEDULED' && r.scheduledAt
                                            ? formatDateTime(r.scheduledAt)
                                            : formatDateTime(r.createdAt)}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </>
    );
}