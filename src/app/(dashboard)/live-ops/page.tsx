'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useI18n } from '@/lib/i18n';
import { useRealtime } from '@/lib/realtime';
import {
    opsApi,
    type OpsActiveRide,
    type OpsAlert,
    type OpsDashboard,
    type OpsLiveDriver,
    type OpsScheduledRide,
} from '@/lib/api';

const POLL_MS = 10000;
const DAMASCUS: [number, number] = [33.5138, 36.2765];

// Minimal Leaflet typings to avoid adding a dependency.
type LeafletMap = {
    setView: (c: [number, number], z: number) => LeafletMap;
    removeLayer: (l: unknown) => void;
    fitBounds: (b: unknown, opts?: unknown) => void;
};
type Leaflet = {
    map: (el: HTMLElement) => LeafletMap;
    tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (m: LeafletMap) => void };
    marker: (c: [number, number], opts?: unknown) => {
        addTo: (m: LeafletMap) => { bindPopup: (html: string) => void };
    };
    latLngBounds: (coords: [number, number][]) => unknown;
    divIcon: (opts: Record<string, unknown>) => unknown;
};
declare global {
    interface Window {
        L?: Leaflet;
    }
}

function loadLeaflet(): Promise<Leaflet> {
    return new Promise((resolve, reject) => {
        if (window.L) return resolve(window.L);

        const cssId = 'leaflet-css';
        if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => (window.L ? resolve(window.L) : reject(new Error('Leaflet failed')));
        script.onerror = () => reject(new Error('Leaflet failed to load'));
        document.body.appendChild(script);
    });
}

export default function LiveOpsPage() {
    const { t, isAr } = useI18n();
    const { onRefresh } = useRealtime();

    const [dashboard, setDashboard] = useState<OpsDashboard | null>(null);
    const [alerts, setAlerts] = useState<OpsAlert[]>([]);
    const [drivers, setDrivers] = useState<OpsLiveDriver[]>([]);
    const [rides, setRides] = useState<OpsActiveRide[]>([]);
    const [scheduledRides, setScheduledRides] = useState<OpsScheduledRide[]>([]);
    const [health, setHealth] = useState<'ok' | 'degraded' | 'down' | null>(null);
    const [loading, setLoading] = useState(true);

    const mapRef = useRef<LeafletMap | null>(null);
    const mapElRef = useRef<HTMLDivElement | null>(null);
    const markersRef = useRef<unknown[]>([]);

    const load = useCallback(async () => {
        // Each endpoint is independent: a single failure must not blank the page.
        const [dash, q, map, active, scheduled, h] = await Promise.allSettled([
            opsApi.dashboard(),
            opsApi.queues(),
            opsApi.liveMap(),
            opsApi.activeRides(),
            opsApi.scheduledRides(),
            opsApi.health(),
        ]);
        if (dash.status === 'fulfilled') setDashboard(dash.value.data);
        if (q.status === 'fulfilled') setAlerts(q.value.data.alerts ?? []);
        if (map.status === 'fulfilled') setDrivers(map.value.data.drivers ?? []);
        if (active.status === 'fulfilled') setRides(active.value.data ?? []);
        if (scheduled.status === 'fulfilled') setScheduledRides(scheduled.value.data ?? []);
        if (h.status === 'fulfilled') setHealth(h.value.data?.status ?? null);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, POLL_MS);
        const unsub = onRefresh(load);
        return () => {
            clearInterval(timer);
            unsub();
        };
    }, [load, onRefresh]);

    // Init Leaflet map once.
    useEffect(() => {
        let cancelled = false;
        loadLeaflet()
            .then((L) => {
                if (cancelled || !mapElRef.current || mapRef.current) return;
                const map = L.map(mapElRef.current).setView(DAMASCUS, 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap',
                    maxZoom: 19,
                }).addTo(map);
                mapRef.current = map;
            })
            .catch(() => {
                /* map optional */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Sync driver markers.
    useEffect(() => {
        const L = window.L;
        const map = mapRef.current;
        if (!L || !map) return;

        markersRef.current.forEach((m) => map.removeLayer(m));
        markersRef.current = [];

        drivers.forEach((d) => {
            const color = d.isAvailable ? '#22c55e' : '#f59e0b';
            const icon = L.divIcon({
                className: 'driver-dot',
                html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 6px ${color}"></div>`,
                iconSize: [14, 14],
            });
            const marker = L.marker([d.lat, d.lng], { icon }).addTo(map);
            marker.bindPopup(
                `<b>${d.name}</b><br>${d.phone ?? ''}<br>${d.status ?? ''}`,
            );
            markersRef.current.push(marker);
        });

        if (drivers.length) {
            map.fitBounds(
                L.latLngBounds(drivers.map((d) => [d.lat, d.lng] as [number, number])),
                { padding: [40, 40], maxZoom: 14 },
            );
        }
    }, [drivers]);

    async function handleCancel(rideId: number) {
        if (!window.confirm(t.cancelRideConfirm)) return;
        try {
            await opsApi.cancelRide(rideId, 'Ops manual cancel');
            await load();
        } catch {
            /* ignore */
        }
    }

    const healthLabel =
        health === 'ok' ? t.opsHealthy : health === 'down' ? t.opsDown : t.opsDegraded;
    const healthColor =
        health === 'ok' ? '#22c55e' : health === 'down' ? '#ef4444' : '#f59e0b';

    const kpis = dashboard
        ? [
              { label: t.activeRidesNow, value: dashboard.rides.active, color: '#818cf8' },
              { label: t.searching, value: dashboard.rides.searching, color: '#fbbf24' },
              { label: t.scheduledKpi, value: dashboard.rides.scheduled ?? 0, color: '#38bdf8' },
              { label: t.completedToday, value: dashboard.rides.completedToday, color: '#4ade80' },
              { label: t.onlineDriversShort, value: dashboard.drivers.online, color: '#22d3ee' },
              { label: t.pendingApproval, value: dashboard.drivers.pendingApproval, color: '#f472b6' },
              { label: t.awaitingPayment, value: dashboard.payments.ridesAwaitingConfirm, color: '#fb923c' },
              { label: t.dispatchQueue, value: dashboard.infrastructure.dispatchQueueLength, color: '#a78bfa' },
              { label: t.socketConnections, value: dashboard.infrastructure.socketConnections, color: '#60a5fa' },
          ]
        : [];

    return (
        <>
            <Header title={t.controlRoom} />
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Health bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--text-2, #a1a1aa)' }}>{t.controlRoomDesc}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                            color: healthColor, border: `1px solid ${healthColor}40`, background: `${healthColor}14`,
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: healthColor }} />
                            {health ? healthLabel : '—'}
                        </span>
                        <button
                            onClick={load}
                            style={{
                                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                                background: 'rgba(255,255,255,0.05)', color: '#d4d4d8',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            {t.refresh}
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                    {(loading && !dashboard ? Array.from({ length: 9 }) : kpis).map((k, i) => {
                        const kpi = k as { label: string; value: number; color: string } | undefined;
                        return (
                            <div key={kpi?.label ?? i} style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '14px', padding: '16px',
                            }}>
                                <div style={{ fontSize: '26px', fontWeight: 700, color: kpi?.color ?? '#52525b' }}>
                                    {kpi?.value ?? '—'}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-2, #a1a1aa)', marginTop: '4px' }}>
                                    {kpi?.label ?? ''}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Alerts */}
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', marginBottom: '8px' }}>
                        {t.systemAlerts}
                    </h2>
                    {alerts.length === 0 ? (
                        <div style={{
                            padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
                            color: '#4ade80', background: 'rgba(34,197,94,0.08)',
                            border: '1px solid rgba(34,197,94,0.15)',
                        }}>
                            {t.noAlerts}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {alerts.map((a) => {
                                const c = a.level === 'critical' ? '#ef4444' : '#f59e0b';
                                return (
                                    <div key={a.code} style={{
                                        padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
                                        color: c, background: `${c}14`, border: `1px solid ${c}33`,
                                    }}>
                                        <strong>{a.code}</strong> — {a.message}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Map */}
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', marginBottom: '8px' }}>
                        {t.liveMap} <span style={{ color: 'var(--text-2,#a1a1aa)', fontWeight: 400 }}>· {drivers.length} {t.driversOnMap}</span>
                    </h2>
                    <div
                        ref={mapElRef}
                        style={{
                            height: '420px', borderRadius: '14px', overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.08)', background: '#1a1a2e',
                        }}
                    />
                </div>

                {/* Active rides */}
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', marginBottom: '8px' }}>
                        {t.activeRidesNow} <span style={{ color: 'var(--text-2,#a1a1aa)', fontWeight: 400 }}>· {rides.length}</span>
                    </h2>
                    {rides.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-2,#a1a1aa)' }}>{t.noActiveRides}</p>
                    ) : (
                        <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-2,#a1a1aa)', textAlign: isAr ? 'right' : 'left' }}>
                                        <th style={thStyle}>#</th>
                                        <th style={thStyle}>{t.status}</th>
                                        <th style={thStyle}>{t.passenger}</th>
                                        <th style={thStyle}>{t.driver}</th>
                                        <th style={thStyle}>{t.fare}</th>
                                        <th style={thStyle}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rides.map((r) => (
                                        <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#d4d4d8' }}>
                                            <td style={tdStyle}>{r.id}</td>
                                            <td style={tdStyle}>{r.status}</td>
                                            <td style={tdStyle}>{r.passenger?.phone ?? '—'}</td>
                                            <td style={tdStyle}>{r.driver?.name || '—'}</td>
                                            <td style={tdStyle}>{r.estimatedFare}</td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => handleCancel(r.id)}
                                                    style={{
                                                        padding: '4px 10px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer',
                                                        color: '#f87171', background: 'rgba(239,68,68,0.1)',
                                                        border: '1px solid rgba(239,68,68,0.25)',
                                                    }}
                                                >
                                                    {t.cancelRide}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Scheduled rides */}
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', marginBottom: '8px' }}>
                        {t.scheduledRidesTitle} <span style={{ color: 'var(--text-2,#a1a1aa)', fontWeight: 400 }}>· {scheduledRides.length}</span>
                    </h2>
                    {scheduledRides.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-2,#a1a1aa)' }}>{t.noScheduledRidesOps}</p>
                    ) : (
                        <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-2,#a1a1aa)', textAlign: isAr ? 'right' : 'left' }}>
                                        <th style={thStyle}>#</th>
                                        <th style={thStyle}>{t.scheduledFor}</th>
                                        <th style={thStyle}>{t.passenger}</th>
                                        <th style={thStyle}>{t.fare}</th>
                                        <th style={thStyle}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scheduledRides.map((r) => (
                                        <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#d4d4d8' }}>
                                            <td style={tdStyle}>{r.id}</td>
                                            <td style={{ ...tdStyle, color: '#38bdf8', fontWeight: 600 }}>{fmtSchedule(r.scheduledAt, isAr)}</td>
                                            <td style={tdStyle}>{r.passenger?.phone ?? r.passenger?.name ?? '—'}</td>
                                            <td style={tdStyle}>{r.estimatedFare}</td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => handleCancel(r.id)}
                                                    style={{
                                                        padding: '4px 10px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer',
                                                        color: '#f87171', background: 'rgba(239,68,68,0.1)',
                                                        border: '1px solid rgba(239,68,68,0.25)',
                                                    }}
                                                >
                                                    {t.cancelRide}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function fmtSchedule(iso: string | null, isAr: boolean): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(isAr ? 'ar-SY' : 'en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const thStyle: React.CSSProperties = { padding: '10px 14px', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '10px 14px' };
