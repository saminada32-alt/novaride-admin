'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { useI18n } from '@/lib/i18n';
import { useMarket } from '@/lib/market-context';
import { opsApi, type OpsSosIncident } from '@/lib/api';

const POLL_MS = 10000;

export default function SafetySosPage() {
    const { isAr } = useI18n();
    const { marketCode } = useMarket();
    const [rows, setRows] = useState<OpsSosIncident[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await opsApi.sosIncidents(marketCode);
            setRows(Array.isArray(res.data) ? res.data : []);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? 'Failed to load SOS');
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

    return (
        <>
            <Header
                title={isAr ? 'مكتب SOS' : 'SOS Safety Desk'}
                subtitle={isAr
                    ? 'حوادث الطوارئ الأخيرة من الرحلات النشطة'
                    : 'Recent emergency activations from active rides'}
            />
            <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
                {loading ? (
                    <p style={{ color: '#71717a' }}>Loading...</p>
                ) : rows.length === 0 ? (
                    <p style={{ color: '#52525b' }}>
                        {isAr ? 'لا توجد حوادث SOS حديثة' : 'No recent SOS incidents'}
                    </p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ color: '#71717a' }}>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'الوقت' : 'Time'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'الرحلة' : 'Ride'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'المُفعّل' : 'Triggered by'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'الراكب' : 'Passenger'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'السائق' : 'Driver'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'الموقع' : 'Location'}</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>{isAr ? 'السوق' : 'Market'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const lat = row.meta?.lat;
                                const lng = row.meta?.lng;
                                const mapUrl = lat != null && lng != null
                                    ? `https://maps.google.com/?q=${lat},${lng}`
                                    : null;
                                const role = row.meta?.role ?? '—';

                                return (
                                    <tr
                                        key={row.id}
                                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <td style={{ padding: 10, color: '#a1a1aa' }}>
                                            {new Date(row.createdAt).toLocaleString(isAr ? 'ar-SY' : 'en-GB')}
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            <Link href={`/rides/${row.rideId}`} style={{ color: '#818cf8' }}>
                                                #{row.rideId}
                                            </Link>
                                            {row.ride?.status ? (
                                                <span style={{ color: '#71717a', marginLeft: 6 }}>
                                                    {row.ride.status}
                                                </span>
                                            ) : null}
                                        </td>
                                        <td style={{ padding: 10, color: '#f87171', fontWeight: 600 }}>
                                            {role}
                                        </td>
                                        <td style={{ padding: 10, color: '#d4d4d8' }}>
                                            {row.ride?.passenger?.name ?? '—'}
                                            {row.ride?.passenger?.phone ? (
                                                <div style={{ color: '#71717a', fontSize: 11 }}>
                                                    {row.ride.passenger.phone}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td style={{ padding: 10, color: '#d4d4d8' }}>
                                            {row.ride?.driver?.name ?? '—'}
                                            {row.ride?.driver?.phone ? (
                                                <div style={{ color: '#71717a', fontSize: 11 }}>
                                                    {row.ride.driver.phone}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            {mapUrl ? (
                                                <a
                                                    href={mapUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: '#818cf8' }}
                                                >
                                                    {lat?.toFixed(5)}, {lng?.toFixed(5)}
                                                </a>
                                            ) : (
                                                <span style={{ color: '#52525b' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: 10, color: '#71717a' }}>
                                            {row.ride?.marketCode ?? '—'}
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
