'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { ridesApi, opsApi } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function RideDetailPage() {
    const { id } = useParams();
    const { isAr } = useI18n();
    const rideId = Number(id);
    const [ride, setRide] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!rideId) return;
        setLoading(true);
        try {
            const res = await ridesApi.getAdminDetail(rideId);
            setRide(res.data);
            if (res.data?.ops?.canAssign || res.data?.ops?.canReassign) {
                const c = await opsApi.assignCandidates(rideId);
                setCandidates(Array.isArray(c.data) ? c.data : c.data?.candidates ?? []);
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed to load ride');
        } finally {
            setLoading(false);
        }
    }, [rideId]);

    useEffect(() => { load(); }, [load]);

    async function cancelRide() {
        if (!confirm(isAr ? 'إلغاء الرحلة؟' : 'Cancel ride?')) return;
        try {
            await opsApi.cancelRide(rideId, 'Admin cancel');
            toast.success('Cancelled');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    async function confirmPayment() {
        try {
            await opsApi.confirmPayment(rideId);
            toast.success(isAr ? 'تم تأكيد الدفع' : 'Payment confirmed');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    async function assign(driverId: number) {
        try {
            await opsApi.assignDriver(rideId, driverId);
            toast.success(isAr ? 'تم التعيين' : 'Driver assigned');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    async function reassign(driverId: number) {
        try {
            await opsApi.reassignDriver(rideId, driverId);
            toast.success(isAr ? 'تم إعادة الإسناد' : 'Driver reassigned');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    if (loading) return (<><Header title={`Ride #${rideId}`} /><p style={{ padding: 32, color: '#71717a' }}>Loading...</p></>);
    if (!ride) return (<><Header title={`Ride #${rideId}`} /><p style={{ padding: 32, color: '#f87171' }}>Not found</p></>);

    return (
        <>
            <Header title={`Ride #${rideId}`} />
            <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
                <Link href="/rides" style={{ color: '#818cf8', fontSize: 13, marginBottom: 16, display: 'inline-block' }}>← {isAr ? 'الرحلات' : 'Rides'}</Link>

                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: 13 }}>{ride.status}</span>
                    {ride.ops?.canCancel && (
                        <button onClick={cancelRide} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                    )}
                    {ride.paymentMethod === 'sham_cash' && !ride.paymentConfirmedAt && (
                        <button onClick={confirmPayment} style={{ background: 'rgba(34,197,94,0.15)', border: 'none', color: '#4ade80', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>Confirm Payment</button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <Card title={isAr ? 'الراكب' : 'Passenger'}>
                        {ride.passenger ? (
                            <p style={{ color: '#fff' }}>
                                <Link href={`/passengers/${ride.passenger.id}`} style={{ color: '#818cf8' }}>
                                    {ride.passenger.firstName} {ride.passenger.lastName}
                                </Link>
                                <br /><span style={{ color: '#71717a', fontSize: 12 }}>{ride.passenger.phone}</span>
                            </p>
                        ) : '—'}
                    </Card>
                    <Card title={isAr ? 'السائق' : 'Driver'}>
                        {ride.driver ? (
                            <p style={{ color: '#fff' }}>
                                <Link href={`/drivers/${ride.driver.id}`} style={{ color: '#818cf8' }}>
                                    {ride.driver.firstName} {ride.driver.lastName}
                                </Link>
                                <br /><span style={{ color: '#71717a', fontSize: 12 }}>{ride.driver.phone}</span>
                            </p>
                        ) : '—'}
                    </Card>
                </div>

                <Card title={isAr ? 'التفاصيل' : 'Details'}>
                    <Row label="Pickup" value={ride.pickupAddress} />
                    <Row label="Dropoff" value={ride.dropoffAddress} />
                    <Row label="Fare" value={formatCurrency(ride.finalFare ?? ride.estimatedFare)} />
                    <Row label="Payment" value={`${ride.paymentMethod ?? '—'} ${ride.paymentConfirmedAt ? '✓' : ''}`} />
                    <Row label="Created" value={formatDateTime(ride.createdAt)} />
                </Card>

                {ride.ops?.canAssign && candidates.length > 0 && (
                    <Card title={isAr ? 'تعيين سائق' : 'Assign Driver'}>
                        {candidates.slice(0, 8).map((d: any) => (
                            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#d4d4d8' }}>#{d.id} {d.name ?? `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()} ({(d.distanceKm ?? d.distKm)?.toFixed?.(1) ?? '?'} km)</span>
                                <button onClick={() => assign(d.id)} style={{ background: 'rgba(99,102,241,0.2)', border: 'none', color: '#818cf8', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>Assign</button>
                            </div>
                        ))}
                    </Card>
                )}

                {ride.ops?.canReassign && candidates.length > 0 && (
                    <Card title={isAr ? 'إعادة إسناد سائق' : 'Reassign Driver'}>
                        <p style={{ color: '#71717a', fontSize: 12, marginBottom: 10 }}>
                            {isAr
                                ? 'الرحلة نشطة — اختر سائقاً بديلاً متاحاً قريباً من نقطة الالتقاط.'
                                : 'Active ride — pick a nearby replacement driver.'}
                        </p>
                        {candidates.slice(0, 8).map((d: any) => (
                            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#d4d4d8' }}>#{d.id} {d.name ?? `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()} ({(d.distanceKm ?? d.distKm)?.toFixed?.(1) ?? '?'} km)</span>
                                <button onClick={() => reassign(d.id)} style={{ background: 'rgba(245,158,11,0.15)', border: 'none', color: '#fbbf24', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>
                                    {isAr ? 'إعادة إسناد' : 'Reassign'}
                                </button>
                            </div>
                        ))}
                    </Card>
                )}

                {ride.timeline?.length > 0 && (
                    <Card title="Timeline">
                        {ride.timeline.map((e: any, i: number) => (
                            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                                <span style={{ color: '#818cf8' }}>{e.event}</span>
                                <span style={{ color: '#52525b', marginLeft: 8 }}>{formatDateTime(e.createdAt)}</span>
                            </div>
                        ))}
                    </Card>
                )}

                {ride.fraudAlerts?.length > 0 && (
                    <Card title="Fraud Alerts">
                        {ride.fraudAlerts.map((a: any) => (
                            <p key={a.id} style={{ color: '#fbbf24', fontSize: 13 }}>#{a.id} {a.type} ({a.severity})</p>
                        ))}
                    </Card>
                )}
            </div>
        </>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#71717a', marginBottom: 10, letterSpacing: '0.06em' }}>{title.toUpperCase()}</p>
            {children}
        </div>
    );
}

function Row({ label, value }: { label: string; value: any }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ color: '#71717a' }}>{label}</span>
            <span style={{ color: '#fff' }}>{value ?? '—'}</span>
        </div>
    );
}
